const { Map } = require("../db/db.config");
const mapService = exports;

mapService.updateVersion = async(body) => {
    return new Promise(async(resolve, reject) => {
        try {
            let map = await Map.update({
                latestVersion: body.version
            }, {
                where: {
                    id: 1
                }
            });
            resolve(map);
        } catch(err) {
            reject(err)
        }
    })
}