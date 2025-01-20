import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    address_line: {
      type: String,
      required: [true, 'Enter address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Enter city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Enter state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Enter pincode'],
      validate: {
        validator: function (v) {
          return /\d{6}/.test(v);
        },
        message: 'Pincode must be a 6-digit number',
      },
    },
    country: {
      type: String,
      required: [true, 'Enter country'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Enter mobile'],
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v);
        },
        message: 'Mobile number must be a 10-digit number',
      },
    },
  },
  { timestamps: true }
);

const AddressModel = mongoose.model('Address', addressSchema);

export default AddressModel;
