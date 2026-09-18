export const LEAD_POPULATE = [
  //   {
  //     path: "assignedTo",
  //     select: "fullName email phone role parentUser ancestorIds branch region",
  //   },

  {
    path: "assignedTo",
    select: "fullName email phone role parentUser ancestorIds branch region",
    populate: [
      {
        path: "role",
        select: "name description roleLevel",
      },
      {
        path: "parentUser",
        select: "fullName email role",
        populate: {
          path: "role",
          select: "name description roleLevel",
        },
      },
      {
        path: "ancestorIds",
        select: "fullName email role",
        populate: {
          path: "role",
          select: "name description roleLevel",
        },
      },
    ],
  },
  {
    path: "currentOwner",
    select: "fullName email role",
  },
  {
    path: "createdBy",
    select: "fullName email role",
  },
  {
    path: "updatedBy",
    select: "fullName email role",
  },
  {
    path: "archivedBy",
    select: "fullName email role",
  },
  {
    path: "category",
    select: "name description isDeleted",
  },
  // {
  //   path: "duplicateOf",
  //   select: "fullName phone email stage status",
  // },

  
  //   {
  //   path: "assignmentInfo.changedBy",
  //   select: "fullName role",
  //   populate: {
  //     path: "role",
  //     select: "name description roleLevel",
  //   },
  // },
];


export function stageSummaryPipeline(filter) {
  return [
    { $match: filter },
    {
      $group: {
        _id: null,
        // won: { $sum: { $cond: [{ $eq: ["$stage", "closed_won , project_onboard", "payment"] }, 1, 0] } },
         won: {
          $sum: {
            $cond: [{$in: [ "$stage",["closed_won", "project_onboard", "payment"]] }, 1, 0,], },},
        lost: {
          $sum: {
            $cond: [{ $in: ["$stage", ["closed_lost", "lost_lead", "dump", "junk_lead", "invalid"]] }, 1, 0],
          },
        },
        inProgress: {
          $sum: {
            $cond: [
              {
                $not: {
                  $in: [
                    "$stage",
                    [
                      "not_answered",
                      "closed_won",
                      "closed_lost",
                      "archived",
                      "dump",
                      "lost_lead",
                      "junk_lead",
                      "invalid",
                    ],
                  ],
                },
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];
}
