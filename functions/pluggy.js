const { PluggyClient } = require("pluggy-sdk");

const IMPORT_CATEGORY_NAME = "Importado (Open Finance)";
const SYNC_LOOKBACK_DAYS = 3;
const FIRESTORE_BATCH_LIMIT = 400;

function toDateOnly(value) {
	if (!value) return null;
	// O SDK da Pluggy desserializa datas ISO em objetos Date.
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

async function ensureImportCategoria(db) {
	const snap = await db
		.collection("categorias")
		.where("nomeCategoria", "==", IMPORT_CATEGORY_NAME)
		.limit(1)
		.get();

	if (!snap.empty) {
		return { id: snap.docs[0].id, nomeCategoria: IMPORT_CATEGORY_NAME };
	}

	const ref = await db.collection("categorias").add({
		nomeCategoria: IMPORT_CATEGORY_NAME,
	});
	return { id: ref.id, nomeCategoria: IMPORT_CATEGORY_NAME };
}

function buildTransactionPayload({ tx, account, categoria, ownerUID, label }) {
	const isCredit = tx.type === "CREDIT";
	const dataTx = toDateOnly(tx.date);
	const valor = Math.abs(tx.amount);

	const payload = {
		created: new Date(),
		categoria: categoria.nomeCategoria,
		categoriaID: categoria.id,
		tipo: isCredit ? "Receita" : "Despesa",
		descricao: tx.description || "Transação importada",
		valor,
		userID: ownerUID,
		origem: "pluggy",
		pluggyTitular: label,
		pluggyAccountId: account.id,
		pluggyTransactionId: tx.id,
	};

	if (isCredit) {
		payload.status = "Recebido";
		payload.dataRecebimento = dataTx;
		payload.dataPrevisao = dataTx;
	} else {
		payload.status = "Paga";
		payload.dataPagamento = dataTx;
		payload.dataVencimento = dataTx;
	}

	return { isCredit, payload };
}

async function commitInChunks(db, docsToWrite) {
	for (let i = 0; i < docsToWrite.length; i += FIRESTORE_BATCH_LIMIT) {
		const chunk = docsToWrite.slice(i, i + FIRESTORE_BATCH_LIMIT);
		const batch = db.batch();
		for (const { ref, payload } of chunk) {
			batch.set(ref, payload, { merge: true });
		}
		await batch.commit();
	}
}

async function syncCredentialSet({ db, ownerUID, label, clientId, clientSecret, itemIds }) {
	if (!itemIds || itemIds.length === 0) {
		throw new Error(`Nenhum itemId configurado para o titular "${label}"`);
	}

	const client = new PluggyClient({ clientId, clientSecret });
	const categoria = await ensureImportCategoria(db);

	const dateFromObj = new Date();
	dateFromObj.setDate(dateFromObj.getDate() - SYNC_LOOKBACK_DAYS);
	const dateFrom = dateFromObj.toISOString().slice(0, 10);

	let accountsProcessed = 0;
	let transactionsWritten = 0;
	const docsToWrite = [];

	for (const itemId of itemIds) {
		const accountsResponse = await client.fetchAccounts(itemId);
		const accounts = accountsResponse?.results ?? accountsResponse ?? [];

		for (const account of accounts) {
			accountsProcessed += 1;

			const transactions = await client.fetchAllTransactions(account.id, {
				dateFrom,
			});
			const txList = transactions?.results ?? transactions ?? [];

			for (const tx of txList) {
				const collectionName = tx.type === "CREDIT" ? "receitas" : "despesas";
				const ref = db.collection(collectionName).doc(`pluggy_${tx.id}`);
				const { payload } = buildTransactionPayload({
					tx,
					account,
					categoria,
					ownerUID,
					label,
				});
				docsToWrite.push({ ref, payload });
			}
		}
	}

	await commitInChunks(db, docsToWrite);
	transactionsWritten = docsToWrite.length;

	return { label, accountsProcessed, transactionsWritten };
}

module.exports = { syncCredentialSet };
