import { defineStore } from 'pinia';

interface ObjectList {
    [key: string]: string[];
}

const fullKeys = [
    '0', '1', '11', '12', '13',
    '2', '21', '22', '23', '24', '25', '26', '27', '28', '29', '291', '292',
    '3', '31', '32', '33', '34',
    '4', '41', '42',
    '5', '7', '6', '61', '62', '63', '64', '65', '66',
    '100', '101', '102', '103', '104', '105', '106', '107', '108', '109',
    '110', '111', '112',
    '120', '9',
    '130', '131',
    '140', '8',
    '150',
    '160', '161',
];

export const usePermissStore = defineStore('permiss', {
    state: () => {
        const defaultList: ObjectList = {
            admin: fullKeys,
            user: ['0', '1', '11', '12', '13'],
        };
        const username = localStorage.getItem('vuems_name');
        // Any logged-in user gets the full menu set so the migrated pages
        // are visible. Real RBAC from the backend is follow-up work.
        return {
            key: (username ? defaultList.admin : defaultList.user) as string[],
            defaultList,
        };
    },
    actions: {
        handleSet(val: string[]) {
            this.key = val;
        },
        setKey(val: string[]) {
            if (!val || val.length === 0) return;
            const merged = Array.from(new Set([...this.key, ...val]));
            this.key = merged;
        },
        reset() {
            const username = localStorage.getItem('vuems_name');
            this.key = username ? this.defaultList.admin : this.defaultList.user;
        },
    },
});
