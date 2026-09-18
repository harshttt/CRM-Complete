import mongoose from 'mongoose';

export default function BaseModel(schemaDef = {}, options = {}) {
  const baseSchema = new mongoose.Schema(
    {
      ...schemaDef,
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      isDeleted: { type: Boolean, default: false },
      deletedAt: { type: Date, default: null }
    },
    {
      timestamps: true,
      versionKey: 'version',
      ...options,
    }
  );

  baseSchema.pre(/^find/, function () {
    if (!this.getOptions().ignoreDeleted) {
      this.where({ isDeleted: false });
    }
  });

  baseSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };
  baseSchema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  baseSchema.statics.paginate = async function ({
    page = 1,
    limit = 10,
    filter = {},
    sort = { createdAt: -1 },
    ignoreDeleted = false
  }) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.find(filter).setOptions({ ignoreDeleted }).sort(sort).skip(skip).limit(limit),
      this.countDocuments(filter)
    ]);

    return {
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total
    };
  };

  return baseSchema;
}
