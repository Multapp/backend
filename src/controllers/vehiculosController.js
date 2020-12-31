module.exports = function(vehiculosService) {
    return {
        getVehiculos: function(req, res, next) {
            vehiculosService.getVehiculos(req, res, next)
        },
        addMarca: function(req, res, next) {
            vehiculosService.addMarca(req, res, next)
        },
        addModelo: function(req, res, next) {
            vehiculosService.addModelo(req, res, next)
        },
        deleteMarca: function(req, res, next) {
            vehiculosService.deleteMarca(req, res, next)
        },
        deleteModelo: function(req, res, next) {
            vehiculosService.deleteModelo(req, res, next)
        },
    }
}