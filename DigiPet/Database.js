// Database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pet.db');

const initDB = () => {
    db.transaction(tx => {
        tx.executeSql(
            'CREATE TABLE IF NOT EXISTS pet_state (id INTEGER PRIMARY KEY NOT NULL, happiness INTEGER);',
            [],
            () => console.log('Table created successfully'),
            (_, err) => console.log('DB Error: ', err)
        );
    });
};

const updateHappiness = (happiness) => {
    db.transaction(tx => {
        tx.executeSql('UPDATE pet_state SET happiness = ? WHERE id = 1;', [happiness]);
    });
};

const getHappiness = (setHappinessCallback) => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM pet_state;',
            [],
            (_, { rows }) => {
                if (rows.length > 0) {
                    setHappinessCallback(rows._array[0].happiness);
                } else {
                    // Initialize with default happiness 100
                    tx.executeSql('INSERT INTO pet_state (id, happiness) VALUES (1, 100);', [], () => setHappinessCallback(100));
                }
            }
        );
    });
};

export { initDB, updateHappiness, getHappiness };
