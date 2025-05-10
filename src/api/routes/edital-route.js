const app = require('../../server');
const {verifyJWTToken} = require('../util/authentication');
const defaultInternalError = require('../util/util-routes');
const connection = require('../../database/connection-mysql');
const Edital = require('../entities/edital');
const EditalService = require('../services/edital-services');
const multer = require("multer");
const readerExcelSheet = require('xlsx');
const RowRegisteredStudentsSpreadsheet = require('../util/row-registered-students-spreadsheet');
const uuid = require('uuid');
const { query } = require('express');
const { sendEmail } = require('../util/send-email');
const EmailUsuarioNovoNoSistema = require('../util/envio-email/email-usuario-novo-no-sistema');
const { list } = require('firebase/storage');


// ----- Configs
const path_route = '/editais';
// Setting up multer as a middleware to archive uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

//Service de edital
const editalService = new EditalService();

// Cabeçalhos esperados na planilha de alunos inscritos
const expectedHeadersOfSheet = ['nome', 'cpf', 'email', 'telefone', 'curso', 'classificacao', 'status'];

//Operações de CRUD
app.get(path_route, verifyJWTToken, (req, res) => {
    try {
        const query = "SELECT * FROM edital";
        connection.query(query, (err, results) => {
            if(!err) {
                res.status(200).json(results);
            } else {
                defaultInternalError(res, err);;
            }
        });
    } catch(err) {
        defaultInternalError(res, err);
    }
});

app.post(path_route, verifyJWTToken, upload.single("planilha_alunos_inscritos"), (req, res) => {
    dadosPlanilhaParaPersistencia = new Array();
    listaResultadosOperacoes = new Array();

    try {
        if(req.body.id === undefined || req.body.id === null) {
            //Se o id não for informado, ele é setado como 0, isso é feito para que o método isValid() funcione corretamente
            //pois ele verifica se todas as propriedades do objeto são válidas, e se o id não for informado, ele será undefined
            //e o método isValid() retornará que o id está faltando, mesmo que ele não seja obrigatório para esse caso de criação
            //de usuário onde o id é gerado automaticamente pelo banco de dados.
            req.body.id = 1;
        };

        const edital = new Edital(req.body);
        const {error, valid} = edital.isValid();
    
        if(!valid) {
            return res.status(400).json({
                error: error.join(',')
            });
        }

        //Verifica se a planilha de alunos inscritos não foi convertida para JSON e enviada no corpo da requisição
        if(req.body.planilha_alunos_inscritos_json === undefined || req.body.planilha_alunos_inscritos_json === null) {
            //Valida a planilha de alunos inscritos pelo método padrão e obtém os objetos criados a partir dela
            dadosPlanilhaParaPersistencia = validarPlanilhaAlunosInscritos(res, req)
        
        //Caso tenha sido convertida para JSON e enviada no corpo da requisição repassa a validação para o método responsável
        } else {
            dadosPlanilhaParaPersistencia = validarPlanilhaAlunosInscritosJSON(res, req);
        }

        const query = "INSERT INTO edital (nome, dt_abertura) VALUES (?, ?)";
        const lastInsertIdQuery = "SELECT LAST_INSERT_ID() as id_edital";
        connection.query(query, [edital.nome, edital.dt_abertura], (err, resultsInsercaoEdital) => {
            if(!err) {
                connection.query(lastInsertIdQuery, (error, resultslastInsertIdQuery) => {
                    if (error) {
                        res.status(500).json({
                            error: 'Internal Server Error: ' + err
                        });
                    } else {
                        //Antes de realizar a persistência dos dados da planilha, verifica a quantidade registros na tabela aluno_curso_edital_matricula
                        //Desta forma poderá checar se o número acresido a ela apoós a persistência dos dados da planilha é igual a quantidade de registros da planilha
                        const queryCountAlunoCursoEditalMatricula = "SELECT COUNT(*) as quantidade_registros FROM aluno_curso_edital_matricula";
                        connection.query(queryCountAlunoCursoEditalMatricula, (err, resultsCountAlunoCursoEditalMatricula) => {
                            if(err) {
                                res.status(500).json({
                                    error: 'Internal Server Error: ' + err
                                });
                            } else {

                                //Caso o edital tenha sido cadastrado com sucesso e o seu id tenha sido obtido é realizado a persistência dos dados da planilha
                                const idEdital = resultslastInsertIdQuery[0].id_edital;
                                const resultadoPersintencia = persistirDadosDaPlanilha(dadosPlanilhaParaPersistencia, idEdital);
                                
                                if(resultadoPersintencia) {

                                    //Após a persistência dos dados da planilha, é verificado a quantidade de registros na tabela aluno_curso_edital_matricula
                                    //Se a quantidade ascrecida a ela for igual a quantidade de registros da planilha, então a persistência foi realizada com sucesso

                                    connection.query(queryCountAlunoCursoEditalMatricula, (err, resultsCountAlunoCursoEditalMatriculaDepois) => {
                                        if(err) {
                                            res.status(500).json({
                                                error: 'Internal Server Error: ' + err
                                            });
                                        } else {
                                            listaResultadosOperacoes.push("Edital cadastrado com sucesso");

                                            if(resultsCountAlunoCursoEditalMatricula[0].quantidade_registros + dadosPlanilhaParaPersistencia.length === resultsCountAlunoCursoEditalMatriculaDepois[0].quantidade_registros) {
                    
                                                listaResultadosOperacoes.push("Todos os dados da planilha foram armazenados com sucesso");

                                            } else {
                                                //Obtem a quantidade de divergências entre a quantidade de registros na tabela aluno_curso_edital_matricula
                                                const divergencia = resultsCountAlunoCursoEditalMatriculaDepois[0].quantidade_registros - (resultsCountAlunoCursoEditalMatricula[0].quantidade_registros + dadosPlanilhaParaPersistencia.length);
    
                                                listaResultadosOperacoes.push( 'Erro ao armazenar os dados da planilha: Aparentemente ' + divergencia + ' registros da planilha não foram armazenados.' +
                                                    ' Entre em contato com o suporte para resolver o problema');
                                                
                                            }

                                            //Obtereos todos os registros de usuários e matriculas que a procedure gerou para  podermos fazer os 
                                            //envios de email necessários para cada aluno. Realizamos a consulta por meio de um log responsável
                                            const queryObterRegistrosUsuariosMatriculas = "SELECT * FROM log_registros_gerados_proc_cai WHERE id_edital_pertencente = ?";
                                            connection.query(queryObterRegistrosUsuariosMatriculas, [idEdital], (err, resultsObterRegistrosUsuariosMatriculas) => {
                                                if(err) {
                                                    res.status(500).json({
                                                        error: 'Internal Server Error: ' + err
                                                    });
                                                } else {
                                                    if(resultsObterRegistrosUsuariosMatriculas.length > 0) {
                                                        const {usuariosNovosNoSistema, usuariosNovosNoSistemaComMatriculaNova, usuariosJaCadastradosNoSistemaComMatriculaNova} 
                                                        = tratarListaDeRegistrosInseridosAntesDeEnviarEmails(resultsObterRegistrosUsuariosMatriculas);
                                                        
                                                        editalService.enviarTodosOsEmails({usuariosNovosNoSistema, usuariosNovosNoSistemaComMatriculaNova, usuariosJaCadastradosNoSistemaComMatriculaNova})
                                                            .then((errosObtidos) => {
                                                                if(errosObtidos.length > 0) {
                                                                    listaResultadosOperacoes.push('Houve os seguintes erro nos envios de email para os alunos: ' + errosObtidos.join(', '));
                                                                } else {
                                                                    listaResultadosOperacoes.push('Todos os emails foram enviados com sucesso para os alunos');
                                                                }
                                                                res.status(200).json({
                                                                    success: listaResultadosOperacoes
                                                                });
                                                            });   
                                                    }
                                                    
                                                }
                                            });
                                            
                                        }
                                    });
                                } else {
                                    res.status(500).json({
                                        error: 'Internal Server Error: ' + err
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                res.status(500).json({
                    error: 'Internal Server Error: ' + err
                });
            }
        });
    } catch(err) {
        defaultInternalError(res, err);
    }
});

app.patch(path_route +'/:id', verifyJWTToken, (req, res) => {
    try {
        const edital = new Edital(req.body);
        const {error, valid} = edital.isValid();
    
        if(!valid) {
            return res.status(400).json({
                error: error.join(',')
            });
        }
        const query = "UPDATE edital SET nome = ?, dt_abertura = ? WHERE id_edital = ?";
        const values = [edital.nome, edital.dt_abertura, req.params.id];

        connection.query(query, values, (err, results) => {
            if(!err) {
                res.status(200).json({
                    success: 'Edital atualizado com sucesso'
                });
            } else {
                defaultInternalError(res, err);
            }
        });
    } catch(err) {
        defaultInternalError(res, err);
    }
});

app.delete(path_route +'/:id', verifyJWTToken, (req, res) => {
    try {
        const query = "DELETE FROM edital WHERE id_edital = ?";
        connection.query(query, [req.params.id], (err, results) => {
            if(!err) {
                res.status(200).json({
                    success: 'Edital deletado com sucesso'
                });
            } else {
                defaultInternalError(res, err);
            }
        });
    } catch(err) {
        defaultInternalError(res, err);
    }
});

//Operações a parte do CRUD
function validarPlanilhaAlunosInscritos(res, req) {
    objetosObtidosDaPlanilha = new Array();

     //Verifica se o arquivo foi enviado
     if(req.file === undefined || req.file === null) {
        return res.status(400).json({
            error: 'Planilha de alunos inscritos não foi enviada'
        });
    //Verifica se o arquivo enviado é uma planilha
    } else if(req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return res.status(400).json({
            error: 'Arquivo enviado não é uma planilha'
        });
    } else {

        try {
            // Ler o buffer usando xlsx
            const workbook = readerExcelSheet.read(req.file.buffer, { type: 'buffer' });
        
            // Selecionar a primeira folha
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
        
            // Converter a folha em linhas
            const rows = readerExcelSheet.utils.sheet_to_json(worksheet, { header: 1 });

            //Converter a folha em colunas
            const columns = readerExcelSheet.utils.sheet_to_json(worksheet, { header: 'A' });
            
            if (!rows[0].every((header, index) => header.trim().toLowerCase() === expectedHeadersOfSheet[index].trim().toLowerCase())) {
              throw new Error('Cabeçalhos da planilha incorretos. Ordem esperada: ' + expectedHeadersOfSheet.join(', '));
            } else {
                rows.forEach((row, index) => {
                    if (index === 0) return; // Ignora o cabeçalho
                    const rowRegisteredStudentsSpreadsheet = new RowRegisteredStudentsSpreadsheet({
                        number_row: index + 1,
                        nome: row[0],
                        cpf: row[1],
                        email: row[2],
                        telefone: row[3],
                        curso: row[4],
                        classificacao: row[5],
                        status: row[6],
                    });
                    const { error, valid } = validarLinhaDaPlanilha(rowRegisteredStudentsSpreadsheet);
                    if (error !== undefined) {
                        throw new Error(`Erro na linha ${index + 1}: ${error}`);
                    }
                    //Se alinha for válida, retorna o objeto criado a partir dela
                    else if(valid) {
                        objetosObtidosDaPlanilha.push(rowRegisteredStudentsSpreadsheet);
                    }
                });

                // console.log("Todos as linhas validadas", objetosObtidosDaPlanilha);
                //Se todas as linhas da planilha forem válidas, retorna os objetos criados a partir delas
                return objetosObtidosDaPlanilha;
            }
          } catch (err) {
            console.error('Erro ao ler a planilha:', err);
            throw new Error('Erro ao ler a planilha: ' + err.message);
          }
    }
}

//Método para validar a planilha de alunos inscritos caso ela tenha sido convertida para JSON e enviada no corpo da requisição
function validarPlanilhaAlunosInscritosJSON(res, req) {
    objetosObtidosDaPlanilha = new Array();

    try{
        //Verifica se a planilha de alunos inscritos foi convertida para JSON e enviada no corpo da requisição
        if(req.body.planilha_alunos_inscritos_json === undefined || req.body.planilha_alunos_inscritos_json === null) {
            return res.status(400).json({
                error: 'Planilha de alunos inscritos não foi enviada'
            });
        } else {
            //Tansforma o JSON em um objeto
            req.body.planilha_alunos_inscritos_json = JSON.parse(req.body.planilha_alunos_inscritos_json);
            console.log(req.body.planilha_alunos_inscritos_json);
            //Verifica se a ordem dos cabeçalhos da planilha está correta
            if(!req.body.planilha_alunos_inscritos_json[0].every((header, index) => header.trim().toLowerCase() === expectedHeadersOfSheet[index].trim().toLowerCase())) {
                return res.status(400).json({
                    error: 'Cabeçalhos da planilha incorretos. Ordem esperada: ' + expectedHeadersOfSheet.join(', ')
                });
            } else {
                req.body.planilha_alunos_inscritos_json.forEach((row, index) => {
                    if(index === 0) return; //Ignora o cabeçalho
                    const rowRegisteredStudentsSpreadsheet = new RowRegisteredStudentsSpreadsheet({
                        number_row: index + 1,
                        nome: row[0],
                        cpf: row[1],
                        email: row[2],
                        telefone: row[3],
                        curso: row[4],
                        classificacao: row[5],
                        status: row[6]
                    });
                    const {error, valid} = validarLinhaDaPlanilha(rowRegisteredStudentsSpreadsheet);
                    if (error !== undefined) {
                        throw new Error(`Erro na linha ${index + 1}: ${error}`);
                    } 
                    //Se alinha for válida, retorna o objeto criado a partir dela
                    else if(valid) {
                        objetosObtidosDaPlanilha.push(rowRegisteredStudentsSpreadsheet);
                    }
                });

                // console.log("Todos as linhas validadas", objetosObtidosDaPlanilha);
                //Se todas as linhas da planilha forem válidas, retorna os objetos criados a partir delas
                return objetosObtidosDaPlanilha;
            }
        }

    } catch (err) {
        console.error('Erro ao ler a planilha:', err);
        throw new Error('Erro ao ler a planilha: ' + err.message);
    }
    
}

//O obejeto que deve ser passado para a função validarLinhaDaPlanilha deve ser um objeto do tipo RowRegisteredStudentsSpreadsheet
function validarLinhaDaPlanilha(rowRegisteredStudentsSpreadsheet) {
    //Verifica se o valor passado é um objeto do tipo RowRegisteredStudentsSpreadsheet
    if(!(rowRegisteredStudentsSpreadsheet instanceof RowRegisteredStudentsSpreadsheet)) {
        return {
            error: 'Valor passado não é um objeto do tipo RowRegisteredStudentsSpreadsheet'
        };
    }
    const {error, valid} = rowRegisteredStudentsSpreadsheet.isValid();
    if(!valid) {
        return {
            error: error.join(', ')
        };
    } else { 
        return {valid}
    }
}

function validarSeNaoHaAlunoRepetidoNumMesmoCursoEdital(objetosObtidosDaPlanilha) {
    const alunosRepetidos = new Array();
    const alunosNaoRepetidos = new Array();
    const cursos = new Array();

   //Verifica se há alunos repetidos na lista
    objetosObtidosDaPlanilha.forEach((row) => {
        if(cursos.includes(row.curso)) {
            alunosRepetidos.push(row);
        } else {
            cursos.push(row.curso);
            alunosNaoRepetidos.push(row);
        }
    });

    return alunosNaoRepetidos;
}

function persistirDadosDaPlanilha(objetosObtidosDaPlanilha, idEdital) {
    try {
        objetosObtidosDaPlanilha.forEach((row)=>{
            //Gerar um senha aleatória a partir do uuid para a primeira senha do usuário do aluno
            const senhaAluno = uuid.v4();
            //Verifica se a senha gerada é maior que 100 caracteres
            //Caso seja, subtrai os caracteres excedentes
            if(senhaAluno.length > 100) {
                senhaAluno = senhaAluno.substring(0, 100);
            }

            //Definir os valores
            values = [
                row.nome,
                row.cpf,
                row.email,
                row.telefone,
                row.curso,
                row.classificacao,
                row.status,
                senhaAluno,
                idEdital,
                row.number_row
            ];

            const sql = `CALL cadastrar_aluno_inscrito(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @id_aluno_cadastrado, @id_matricula_aluno_cadastrado, @error_message);`;
            connection.query(sql, values, (err, results) => {
                    if(err) {
                        console.error('Erro ao persistir os dados da planilha:', err);
                        throw new Error('Erro ao persistir os dados da planilha: ' + err.message);
                    } else {
                        // console.log('Aluno cadastrado com sucesso');
                    }
                });
                
        });

        //Se não ocorreu nenhum erro durante a persistência dos dados da planilha, retorna true
        return true;
    } catch (err) {
        console.error('Erro ao persistir os dados da planilha:', err);
        throw new Error('Erro ao persistir os dados da planilha: ' + err.message);
    }
}

function tratarListaDeRegistrosInseridosAntesDeEnviarEmails(listaRegistros) {
    const usuariosNovosNoSistema = Array();
    const usuariosNovosNoSistemaComMatriculaNova = Array();
    const usuariosJaCadastradosNoSistemaComMatriculaNova = Array();

    //Separmos os registros em 3 listas, uma para os usuários novos no sistema, outra para os usuários novos no sistema com matrícula nova
    //E outra para os usuários já cadastrados no sistema com matrícula nova
    listaRegistros.forEach((registro) => {
        if(registro.id_usuario_gerado !== null && registro.id_matricula_gerado === null) {
            usuariosNovosNoSistema.push(registro);
        } else if(registro.id_usuario_gerado !== null && registro.id_matricula_gerado !== null) {
            usuariosNovosNoSistemaComMatriculaNova.push(registro);
        } else if(registro.id_usuario_gerado === null && registro.id_matricula_gerado !== null) {
            usuariosJaCadastradosNoSistemaComMatriculaNova.push(registro);
        } else {
            // console.error("Registro não se encaixa em nenhuma das categorias");
        }
    });

    console.log("\nUsuários novos no sistema", usuariosNovosNoSistema);
    console.log("\n\nUsuários novos no sistema com matrícula nova", usuariosNovosNoSistemaComMatriculaNova);
    console.log("\n\nUsuários já cadastrados no sistema com matrícula nova", usuariosJaCadastradosNoSistemaComMatriculaNova);
    return {usuariosNovosNoSistema, usuariosNovosNoSistemaComMatriculaNova, usuariosJaCadastradosNoSistemaComMatriculaNova};
}