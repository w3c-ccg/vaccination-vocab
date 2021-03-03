const fs = require("fs").promises;
const path = require("path");
const { issue } = require("vc-js");
const { Ed25519KeyPair } = require("@transmute/did-key-ed25519");
const { Bls12381G2KeyPair } = require("@transmute/did-key-bls12381");
const { BbsBlsSignature2020 } = require("@mattrglobal/jsonld-signatures-bbs");
const jsigs = require("jsonld-signatures");

const { getJsonFiles } = require("./utilities");
const { documentLoader } = require("./documentLoader");

const INPUT_FIXTURES_DIRECTORY = "../__fixtures__/inputs";
const OUTPUT_EXAMPLES_DIRECTORY = "../examples";

const JSONLD_FILE_EXTENSION = ".jsonld";

const ED25519_SIGNATURE_FILE_SUFFIX = "-signed-ed25519";
const BBS_SIGNATURE_FILE_SUFFIX = "-signed-bbs";

const ISSUER_KEY_PAIR_SEED_BASE64 = "2owx9/ylDJazW2oubRDPZSZGKzhSRPud1dbJGkufavk=";

const { Ed25519Signature2018 } = jsigs.suites;

const signatureSuiteIssuers = [
    {
        issueFunction: issueWithEd25519Signature2018,
        fileSuffix: ED25519_SIGNATURE_FILE_SUFFIX
    },
    {
        issueFunction: issueWithBbsBlsSignature2020,
        fileSuffix: BBS_SIGNATURE_FILE_SUFFIX
    }
]

async function main() {
    const inputs = getJsonFiles(path.join(__dirname, INPUT_FIXTURES_DIRECTORY));
    
    Object.keys(inputs).forEach(async (item) => {
        await signatureSuiteIssuers.forEach(async (issuer) => {
            const vc = await issuer.issueFunction(inputs[item]);
            const fixtureFileName = path.basename(item).split('.')[0];
            const outputFileName = fixtureFileName + issuer.fileSuffix + JSONLD_FILE_EXTENSION;
            await fs.writeFile(path.join(__dirname, OUTPUT_EXAMPLES_DIRECTORY,outputFileName), JSON.stringify(vc, null, 2));
        });
    })
}

async function issueWithEd25519Signature2018(credential) {
    const keypair = await Ed25519KeyPair.generate({
        secureRandom: () => {
          return Buffer.from(ISSUER_KEY_PAIR_SEED_BASE64,'base64');
        },
    });
    keypair.id = keypair.controller + keypair.id;
    const suite = new Ed25519Signature2018({
        key: keypair,
    });
    return await issue({
        credential: {
            ...credential,
            issuer: keypair.controller,
            issuanceDate: new Date(Date.now()).toISOString()
        },
        suite,
        documentLoader,
    });
}


async function issueWithBbsBlsSignature2020(credential) {
    const keypair = await Bls12381G2KeyPair.generate({
        secureRandom: () => {
            return Buffer.from(ISSUER_KEY_PAIR_SEED_BASE64,'base64');
        },
    });
    keypair.id = keypair.controller + keypair.id;
    const suite = new BbsBlsSignature2020({
        key: keypair,
    });
    return await issue({
        credential: {
            ...credential,
            issuer: keypair.controller,
            issuanceDate: new Date(Date.now()).toISOString()
        },
        suite,
        documentLoader,
    });
}

main();