import * as PDFGeneratorAPI from 'pdf-generator-api-client';
import jwt from 'jsonwebtoken';
import {getSecret} from 'wix-secrets-backend';

/**
 * Returns url to PDF which is valid for 30 days
 *
 * @param {String} workspaceIdentifier
 * @param {Number|String} templateId
 * @param {Object} mergeData
 * @return {Promise<unknown>}
 */
export async function generatePDFUrl(workspaceIdentifier, templateId, mergeData) {
  return generatePDF(workspaceIdentifier, templateId, mergeData, {"output": "url"});
}

/**
 * Returns PDF as text/binary
 *
 * @param {String} workspaceIdentifier
 * @param {Number|String} templateId
 * @param {Object} mergeData
 * @return {Promise<unknown>}
 */
export async function generatePDFBinary(workspaceIdentifier, templateId, mergeData) {
  return generatePDF(workspaceIdentifier, templateId, mergeData, {"output": "I"});
}

/**
 * Returns PDF as base64 encoded text/binary
 * Use @mergeOptions to specify format or output type
 *
 * @param {String} workspaceIdentifier
 * @param {Number|String} templateId
 * @param {Object} mergeData
 * @param {Object} mergeOptions
 * @return {Promise<unknown>}
 */
export async function generatePDF(workspaceIdentifier, templateId, mergeData, mergeOptions) {
  const client = await createClient(workspaceIdentifier);

  return new Promise((resolve, reject) => {
    client.mergeTemplate(templateId, mergeData, mergeOptions, (error, data, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Returns URL to editor
 *
 * @param {String} workspaceIdentifier
 * @param {Number|String} templateId
 * @param {Object} previewData
 * @return {Promise<unknown>}
 */
export async function getEditorUrl(workspaceIdentifier, templateId, previewData) {
  const client = await createClient(workspaceIdentifier);

  return new Promise((resolve, reject) => {
    client.getEditorUrl(templateId, previewData, null, (error, data, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Returns list of available templates for given workspace
 *
 * @param {String} workspaceIdentifier
 * @return {Promise<unknown>}
 */
export async function getTemplates(workspaceIdentifier) {
  const client = await createClient(workspaceIdentifier);

  return new Promise((resolve, reject) => {
    client.getTemplates((error, data, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Creates API client
 * @param {String} workspaceIdentifier
 * @return {Promise<PDFGeneratorAPI.TemplatesApi>}
 */
async function createClient(workspaceIdentifier) {
  const defaultClient = PDFGeneratorAPI.ApiClient.instance;
  let JSONWebTokenAuth = defaultClient.authentications['JSONWebTokenAuth'];

  JSONWebTokenAuth.accessToken = await createJSONWebToken(workspaceIdentifier);
  return new PDFGeneratorAPI.TemplatesApi();
}

/**
 * Generates JWT
 *
 * @param {String} workspaceIdentifier
 * @return {Promise<number|ArrayBuffer>}
 */
async function createJSONWebToken(workspaceIdentifier) {
  const apiKey = await getSecret("pdf_api_key");
  const apiSecret = await getSecret("pdf_api_secret");

  return jwt.sign({
    "iss": apiKey,
    "sub": workspaceIdentifier
  }, apiSecret, {
    expiresIn: 30
  });
}
