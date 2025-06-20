import 'dotenv/config';

export default {
  expo: {
    name: "MeasureLife-Frontend",
    slug: "measurelife-frontend",
    version: "1.0.0",
    extra: {
      BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    },
  },
};
