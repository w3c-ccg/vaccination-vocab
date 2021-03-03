// boilerplate testing structures
const jsonld = require("jsonld");
const { extendContextLoader } = require("jsonld-signatures");

const vacciniationContext = require("../context/v1/index.json");
const credentialsContext = require("./contexts/credentials.json");
const bbsContext = require("./contexts/bbs.json");
const securityV3Context = require("./contexts/securityV3.json");

const { resolver } = require("@transmute/did-key.js");

const contexts = {
  "https://www.w3.org/2018/credentials/v1": credentialsContext,
  "https://w3id.org/vaccination/v1": vacciniationContext,
  "https://w3id.org/security/bbs/v1": bbsContext,
  "https://w3id.org/security/v3-unstable": securityV3Context
};

function customDocLoader(url) {
  const context = contexts[url];

  if (context) {
    return {
      contextUrl: null,
      document: context,
      documentUrl: url,
    };
  }

  if (url.startsWith('did:key')) {
      return {
        contextUrl: null,
        document: resolver.resolve(url),
        documentUrl: url
      };
  }
  return jsonld.documentLoaders.node()(url);
};

module.exports.documentLoader = extendContextLoader(customDocLoader);