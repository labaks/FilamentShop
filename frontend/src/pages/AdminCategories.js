import React from 'react';
import AdminGenericCrud from './AdminGenericCrud';
import { useTranslation } from 'react-i18next';

const AdminCategories = () => {
    const { t } = useTranslation();
    return (
        <AdminGenericCrud apiPath="/categories" title={t('categories')} placeholder={t('name')} />
    );
};

export default AdminCategories;