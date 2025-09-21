import React from 'react';
import AdminGenericCrud from './AdminGenericCrud';

const AdminCategories = () => {
    return (
        <AdminGenericCrud apiPath="/categories" title="Категории" placeholder="Название категории" />
    );
};

export default AdminCategories;