module.exports = function(vehiculosService) {
    return {
        getVehiculos: function(req, res, next) {
            vehiculosService.getVehiculos(req, res, next)
        },
        addVehiculo: function(req, res, next) {
            vehiculosService.addVehiculo(req, res, next)
        },
        editVehiculo: function(req, res, next) {
            vehiculosService.editVehiculo(req, res, next)
        },
        deleteVehiculo: function(req, res, next) {
            vehiculosService.deleteVehiculo(req, res, next)
        },
    }
}