const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { syncCredentialSet } = require("./pluggy");

initializeApp();

const PLUGGY_CLIENT_ID = defineSecret("PLUGGY_CLIENT_ID");
const PLUGGY_CLIENT_SECRET = defineSecret("PLUGGY_CLIENT_SECRET");

// Quando conectar o segundo CPF: criar os secrets PLUGGY_CLIENT_ID_2 /
// PLUGGY_CLIENT_SECRET_2, descomentar as linhas abaixo e adicionar o segundo
// bloco em buildCredentialSets() + na lista "secrets" das duas functions.
// const PLUGGY_CLIENT_ID_2 = defineSecret("PLUGGY_CLIENT_ID_2");
// const PLUGGY_CLIENT_SECRET_2 = defineSecret("PLUGGY_CLIENT_SECRET_2");

function parseItemIds(envValue) {
	return (envValue || "")
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

function buildCredentialSets() {
	const sets = [];

	if (process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET) {
		sets.push({
			label: "titular1",
			clientId: process.env.PLUGGY_CLIENT_ID,
			clientSecret: process.env.PLUGGY_CLIENT_SECRET,
			itemIds: parseItemIds(process.env.PLUGGY_ITEM_IDS),
		});
	}

	// if (process.env.PLUGGY_CLIENT_ID_2 && process.env.PLUGGY_CLIENT_SECRET_2) {
	// 	sets.push({
	// 		label: "titular2",
	// 		clientId: process.env.PLUGGY_CLIENT_ID_2,
	// 		clientSecret: process.env.PLUGGY_CLIENT_SECRET_2,
	// 		itemIds: parseItemIds(process.env.PLUGGY_ITEM_IDS_2),
	// 	});
	// }

	return sets;
}

async function runSync() {
	const ownerUID = process.env.OWNER_UID;
	if (!ownerUID) {
		throw new Error("OWNER_UID não configurado (functions/.env)");
	}

	const credentialSets = buildCredentialSets();
	if (credentialSets.length === 0) {
		throw new Error("Nenhuma credencial Pluggy configurada");
	}

	const db = getFirestore();
	const results = [];
	for (const creds of credentialSets) {
		results.push(await syncCredentialSet({ db, ownerUID, ...creds }));
	}
	return results;
}

exports.syncPluggyDaily = onSchedule(
	{
		schedule: "every day 06:00",
		timeZone: "America/Sao_Paulo",
		secrets: [PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET],
		retryCount: 1,
		memory: "256MiB",
	},
	async () => {
		const results = await runSync();
		console.log("Sincronização Pluggy concluída:", JSON.stringify(results));
	},
);

// Callable só para você testar manualmente (ex: via firebase functions:shell
// ou um curl autenticado) sem precisar esperar o agendamento diário.
exports.syncPluggyNow = onCall(
	{
		secrets: [PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET],
	},
	async (request) => {
		if (!request.auth) {
			throw new HttpsError("unauthenticated", "Faça login para sincronizar.");
		}
		return runSync();
	},
);
