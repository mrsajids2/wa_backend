const TemplateRepository = require("../respository/template.repository");
const response = require("../utils/responseManager");
const kafka = require("../lib/kafka/producer");
const { checkKafkaHealth } = require("../lib/kafka/healthCheck");

exports.createTemplate = async (req, res) => {
  try {
    const { templatename, templatelanguage, templatecontent, companyid } =
      req.body;
    if (!templatename || !templatelanguage || !templatecontent || !companyid) {
      return response.badRequest(res, "All fields are required");
    }
    // Check for duplicate template name for the same company
    const existing = await TemplateRepository.getTemplates("company", {
      filters: { templatename, companyid },
      page: 1,
      pageSize: 1,
    });
    if (existing.total > 0) {
      return response.alreadyExist(
        res,
        "Template name already exists for this company"
      );
    }
    //health check kafka
    const kafkaresponse = await checkKafkaHealth();
    if (!kafkaresponse.success) {
      return response.serverError(res, 500, kafkaresponse.message);
    }

    // Store template in DB with status 'pending'
    const template = await TemplateRepository.createTemplate({
      templatename,
      templatelanguage,
      templatecontent,
      companyid,
      status: "0",
    });
    // Send to Kafka for approval
    await kafka.sendMessage("whatsapp-template-approval", {
      templateId: template.templateid,
      templatename,
      templatelanguage,
      templatecontent,
      companyid,
    });
    return response.success(
      res,
      200,
      "Template created and sent for approval",
      { template }
    );
  } catch (err) {
    console.error("Error creating template:", err);
    return response.serverError(res, "Internal server error");
  }
};

// This endpoint can be called by Kafka consumer when template is approved
exports.approveTemplate = async (req, res) => {
  try {
    const { templateid } = req.body;
    if (!templateid) return response.badRequest(res, "templateid required");

    // 0-pending, 1 - approve 2 - rejected
    const updated = await TemplateRepository.updateStatus(templateid, "1");
    return response.success(res, 200, "Template approved", { updated });
  } catch (err) {
    console.error("Error approving template:", err);
    return response.serverError(res, "Internal server error");
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const { filters = {}, page = 1, pageSize = 10 } = req.body;
    const result = await TemplateRepository.getTemplates("company", {
      filters,
      page,
      pageSize,
    });
    return response.success(res, 200, "Success", result);
  } catch (err) {
    console.error("Error getting templates:", err);
    return response.serverError(res, "Internal server error");
  }
};
