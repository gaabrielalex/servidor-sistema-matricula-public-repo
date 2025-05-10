
const MatriculaServices = require('./matricula-services');

describe('MatriculaServices', () => {

    it('should return a success when the assesment update status to C', () => {
        // Arrange
        const matriculaServices = new MatriculaServices();
        const novoStatus = 'C';
        const emailAluno = 'gabrielaluno@gmail.com';

        // Act
        matriculaServices.alterarStatausDaMatricula({novoStatus, emailAluno})
            // Assert
            .then((result) => {
                expect(result).Not.toBe(null);
            })
            .catch((err) => {
                expect(err).toBe(null);
            });
        
    });
});