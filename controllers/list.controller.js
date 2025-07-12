const { getAllStates, getCitiesByStateId } = require("../respository/list.repository");
const response = require("../utils/responseManager");

exports.getAllStates = async (req, res) => {
    try {
        const states = await getAllStates();
        return response.success(res, 200, '', {
            statelist: states
        })
        res.json(states);
    } catch (error) {
        return response.serverError(res, 500, '', error)
    }
};


exports.getCitiesByState = async (req, res) => {
    try {
        const cities = await getCitiesByStateId(req.body.stateId);
        return response.success(res, 200, '', {
            citylist: cities
        })
    } catch (error) {
        return response.serverError(res, 500, '', error)
    }
};

// exports.getStateById = async (req, res) => {
//   try {
//     const state = await stateRepo.getStateById(req.params.id);
//     if (!state) return res.status(404).json({ message: 'State not found' });
//     res.json(state);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getCities = async (req, res) => {
//     try {
//       const cities = await cityRepo.getAllCities();
//       res.json(cities);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
