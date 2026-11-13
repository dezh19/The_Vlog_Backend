const schema = {
  kind: "collectionType",
  collectionName: "subscribers",
  info: {
    singularName: "subscriber",
    pluralName: "subscribers",
    displayName: "Subscriber",
    description: "Community members who signed up via Join the Community",
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {
    email: { type: "email", required: true, unique: true },
    name: { type: "string" },
  },
};

export default schema;
