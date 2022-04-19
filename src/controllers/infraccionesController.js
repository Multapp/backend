module.exports = function(infraccionesService) {
    return {
        getInfracciones: function(req, res, next) {
            infraccionesService.getInfracciones(req, res, next)
        },
        addInfraccion: function(req, res, next) {
            infraccionesService.addInfraccion(req, res, next)
        },
        editInfraccion: function(req, res, next) {
            infraccionesService.editInfraccion(req, res, next)
        },
        deleteInfraccion: function(req, res, next) {
            infraccionesService.deleteInfraccion(req, res, next)
        },
    }
}