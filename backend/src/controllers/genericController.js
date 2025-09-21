const createGenericController = (model) => ({
    getAll: async (req, res) => {
        try {
            const items = await model.findAll({ order: [['name', 'ASC']] });
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: `Ошибка сервера при получении данных: ${model.name}` });
        }
    },
    create: async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Название обязательно' });
            }
            const newItem = await model.create({ name });
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ message: `Ошибка сервера при создании: ${model.name}` });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const item = await model.findByPk(id);
            if (!item) {
                return res.status(404).json({ message: 'Элемент не найден' });
            }
            item.name = name;
            await item.save();
            res.json(item);
        } catch (error) {
            res.status(500).json({ message: `Ошибка сервера при обновлении: ${model.name}` });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await model.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Элемент не найден' });
            await item.destroy();
            res.status(200).json({ message: 'Элемент успешно удален' });
        } catch (error) {
            res.status(500).json({ message: `Ошибка сервера при удалении: ${model.name}` });
        }
    },
});

module.exports = createGenericController;