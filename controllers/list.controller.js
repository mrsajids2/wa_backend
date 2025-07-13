const List = require("../respository/list.repository");
const response = require("../utils/responseManager");

exports.getAllStates = async (req, res) => {
  try {
    const states = await List.getAllStates("masters");
    return response.success(res, 200, "", {
      statelist: states,
    });
  } catch (error) {
    return response.serverError(res, 500, "", error);
  }
};

exports.getCitiesByState = async (req, res) => {
  try {
    const cities = await List.getCitiesByStateId("masters", req.body.stateId);
    return response.success(res, 200, "", {
      citylist: cities,
    });
  } catch (error) {
    return response.serverError(res, 500, "", error);
  }
};
