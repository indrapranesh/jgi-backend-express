const { Map } = require('../db/db.config');
const mapService = require('../services/mapService');

const mapController = exports;

mapController.updateVersion = async(req, res) => {
    try {
        let result = await mapService.updateVersion(req.body);
        res.send(result);
    } catch(err) {
        res.send(err);
    }
}

mapController.getMap = async(req, res) => {
    try {
        let result = await Map.findOne({where: {id: 1}});
        res.send(result);
    } catch(err) {
        res.send(err);
    }
}