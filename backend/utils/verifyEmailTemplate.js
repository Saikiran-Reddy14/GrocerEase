const verifyEmailTemplate = (name, url) => {
  return `
    <p>Dear ${name}</p>,
    <br />
    <br />
    <p>Thank you for registering to GrocerEase</p>
    <a href="${url}" style="color:white;background:blue;border-radius:20px;margin-top:10px;padding:10px">
      Verify Email
    </a>
  `;
};

export default verifyEmailTemplate;
