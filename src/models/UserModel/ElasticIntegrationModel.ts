import mongoose from "mongoose";

import { ElasticIntegrationSchema } from "../MicroserviceArchitectureModels/Schemas/Schemas.schema";

const ElasticIntegrationModel = mongoose.model("ElasticIntegration",  ElasticIntegrationSchema );

export default ElasticIntegrationModel;
