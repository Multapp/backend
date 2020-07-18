module.exports = function(usuariosService) {
    return{
        getUsuarios: function (req, res, next) {
            usuariosService.getUsuarios(req, res, next)
        },
        getUsuarioById: function (req, res, next) {
            usuariosService.getUsuarioById(req, res, next)
        }
    }
}