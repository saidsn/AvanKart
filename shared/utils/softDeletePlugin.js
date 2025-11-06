import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const softDeletePlugin = (schema) => {
  // Soft delete için deleteOne ve deleteMany metodlarını override ediyoruz
  schema.statics.deleteOne = async function (query) {
    try {
      return this.updateOne(query, { $set: { deletedAt: new Date(), deleted: true } });
    } catch (error) {
      console.error('Error during soft delete (deleteOne):', error);
    }
  };

  schema.statics.deleteMany = async function (query) {
    try {
      return this.updateMany(query, { $set: { deletedAt: new Date(), deleted: true } });
    } catch (error) {
      console.error('Error during soft delete (deleteMany):', error);
    }
  };

  // remove metodunu hard delete yapmak için özelleştiriyoruz
  schema.method('remove', async function () {
    try {
      await this.model('Model').deleteOne({ _id: this._id });
      console.log('Document hard deleted');
    } catch (error) {
      console.error('Error during hard delete:', error);
    }
  }, { suppressWarning: true }); // Uyarıyı bastırıyoruz

  // `mongoose-delete` plugin'ini kullanıyoruz
  schema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
};

export default softDeletePlugin;