import { Todo } from "../models/todo.model.js";
// import { errorHandler } from "../middlewares/error.middleware.js";
/**
 * TODO: Create a new todo
 * - Extract data from req.body
 * - Create todo in database
 * - Return 201 with created todo
 */
//@ts-ignore
export async function createTodo(req, res, next) {
    try {
        const created = await Todo.create(req.body);
        return res.status(201).json(created);
    } catch (error) {
        next(error);
        // errorHandler(error, req, res, next);
    }
}

/**
 * TODO: List todos with pagination and filters
 * - Support query params: page, limit, completed, priority, search
 * - Default: page=1, limit=10
 * - Return: { data: [...], meta: { total, page, limit, pages } }
 */
//@ts-ignore
export async function listTodos(req, res, next) {
    try {
        let { page = 1, limit = 10, completed, priority, search } = req.query;

        page = Math.max(1, parseInt(page) || 1);
        limit = Math.max(1, parseInt(limit) || 10);

        let filter = {};

        if (completed !== undefined) {
            filter.completed = completed === "true";
        }

        if (priority) {
            filter.priority = priority;
        }

        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        const total = await Todo.countDocuments(filter);

        const skip = (page - 1) * limit;
        const pages = Math.ceil(total / limit) || 0;

        const data = await Todo.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            data,
            meta: { total, page, limit, pages },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * TODO: Get single todo by ID
 * - Return 404 if not found
 */
export async function getTodo(req, res, next) {
    try {
        if (req.params.id) {
            let todoId = req.params.id;
            let responseFromDB = await Todo.find({ _id: todoId });
            if (responseFromDB.length === 0) {
                return res
                    .status(404)
                    .json({ error: { message: "not found" } });
            }
            return res.status(200).json(responseFromDB[0]);
        }
    } catch (error) {
        next(error);
    }
}

/**
 * TODO: Update todo by ID
 * - Use findByIdAndUpdate with { new: true, runValidators: true }
 * - Return 404 if not found
 */
export async function updateTodo(req, res, next) {
    try {
        let id = req.params.id;

        let responseFromDB = await Todo.findByIdAndUpdate(
            id,
            { ...req.body },
            {
                new: true,
                runValidators: true,
                lean: true,
            },
        );

        if (!responseFromDB) {
            return res.status(404).json({ error: { message: "not found" } });
        }
        return res.status(200).json(responseFromDB);
    } catch (error) {
        next(error);
    }
}

/**
 * TODO: Toggle completed status
 * - Find todo, flip completed, save
 * - Return 404 if not found
 */
export async function toggleTodo(req, res, next) {
    try {
        let id = req.params.id;
        let responseFromDB = await Todo.findById(id);

        if (!responseFromDB) {
            return res.status(404).json({ error: { message: "not found" } });
        }
        responseFromDB.completed = !responseFromDB.completed;
        responseFromDB.save();

        return res.status(200).json(responseFromDB);
    } catch (error) {
        next(error);
    }
}

/**
 * TODO: Delete todo by ID
 * - Return 204 (no content) on success
 * - Return 404 if not found
 */
export async function deleteTodo(req, res, next) {
    try {
        let id = req.params.id;
        let responseFromDB = await Todo.findByIdAndDelete(id);
        if (!responseFromDB) {
            return res.status(404).json({ error: { message: "not found" } });
        }
        return res.status(204).json(responseFromDB);
    } catch (error) {
        next(error);
    }
}
