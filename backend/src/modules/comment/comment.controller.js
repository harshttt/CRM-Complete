
import {ApiResponse} from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { LeadService } from "../lead/lead.service.js";
import { CommentService } from "./comment.service.js";
import { COMMENT_ENUMS } from "../../constants/comment.constants.js";




export  class CommentController {

      static async getCommentConstants(req, res) {
              return res.json(ApiResponse.success(COMMENT_ENUMS, "Comment constants fetched successfully"));
      }


        static async addComment(req, res, next) {
          try {
            const { id } = req.params;
            const {comment, conversationType, reminderAt, commentType, stage} = req.body;
      
            const result = await LeadService.addComment({
              leadId: id,
              userId: req.user._id,
              comment,
              conversationType,
              commentType,
              reminderAt,
              stage
            });
      
            // if (result.autoRemoved) {
            //   return res.json(
            //     ApiResponse.success(
            //       null,
            //       "Comment added. Lead marked as Not Interested and auto-removed."
            //     )
            //   );
            // }
      
            // const updatedLead = await LeadService.getLeadById(id, req.user);
      
            return res.json(ApiResponse.success(result, "Comment added & lead refreshed"));
          } catch (err) {
            next(err);
          }
        }



}