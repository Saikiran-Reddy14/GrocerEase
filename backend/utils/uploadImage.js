import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadImage = async (image) => {
  const buffer = image?.Buffer || Buffer.from(await image.arrayBuffer());

  const upload_Image = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'grocerease',
        },
        (err, uploadResult) => {
          return resolve(uploadResult);
        }
      )
      .end(buffer);
  });

  return upload_Image;
};

export default uploadImage;
