import { CONSTANTS } from "../constants/index.js";
import { ApiResponse } from "../utils/apiResponse.js";




export class ConstantsController {

    
  static async getAllConstants(req, res) {
    return res.json(
      ApiResponse.success(
        {
          leadEnums: CONSTANTS.LEAD_ENUMS,
          taskEnums: CONSTANTS.TASK_ENUMS,
          commentEnums: CONSTANTS.COMMENT_ENUMS,
          propertyEnums: CONSTANTS.PROPERTY_ENUMS,
          salespersonEnums: CONSTANTS.SALESPERSON_ENUMS
        },
        "All constants fetched successfully"
      )
    );
  }
}


