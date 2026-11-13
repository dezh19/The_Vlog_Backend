export default ({ env }) => {
  const cloudinaryName = env("CLOUDINARY_NAME", "");

  return {
    "users-permissions": {
      config: {
        jwt: {
          expiresIn: "7d",
        },
      },
    },
    ...(cloudinaryName
      ? {
          upload: {
            config: {
              provider: "cloudinary",
              providerOptions: {
                cloud_name: cloudinaryName,
                api_key: env("CLOUDINARY_KEY", ""),
                api_secret: env("CLOUDINARY_SECRET", ""),
              },
              actionOptions: {
                upload: {},
                delete: {},
              },
            },
          },
        }
      : {}),
  };
};
