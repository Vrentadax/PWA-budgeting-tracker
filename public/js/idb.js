let db;
const request = indexedDB.open("budget_tracker", 1);

/* This is creating a new object store in the database. */
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

/* This is a function that is called when the database is successfully opened. It is also checking to
see if the user is online. If they are, it will call the uploadBudget function. */
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudget();
    }
};

/* This is a function that is called when the database is successfully opened. It is also checking to
see if the user is online. If they are, it will call the uploadBudget function. */
request.onerror = function (event) {
    console.log("Error: " + event.target.errorCode);
};

/**
 * The function takes a record as an argument, creates a transaction, creates an object store, and adds
 * the record to the object store.
 * @param record - The record to be saved.
 */
function saveRecord(record) {
    const transaction = db.transaction(["new_budget"], "readwrite");

    const store = transaction.objectStore("new_budget");

    store.add(record);
}

/**
 * It gets all the data from the IndexedDB database, then sends it to the server, then clears the
 * IndexedDB database.
 */
function uploadBudget() {
    const transaction = db.transaction(["new_budget"], "readwrite");

    const store = transaction.objectStore("new_budget");

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["new_budget"], "readwrite");
                    const store = transaction.objectStore("new_budget");
                    store.clear();
                });
        }
    };
}

/**
 * The deletePending() function deletes all pending transactions from the new_budget object store.
 */
function deletePending() {
    const transaction = db.transaction(["new_budget"], "readwrite");
    const store = transaction.objectStore("new_budget");
    store.clear();
}

/* Listening for the online event and then calling the uploadBudget function. */
window.addEventListener("online", uploadBudget);