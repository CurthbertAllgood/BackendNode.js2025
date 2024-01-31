export const validarDatos = (req, res, next) => {
    const { title, descripcion, price, thumbnail, code, stock } = req.body;
    const errores = [];
    if (typeof title !== "string" || title.length === 0) {
        errores.push("El título no es una cadena o es un campo obligatorio.");
    }
    if (typeof descripcion !== "string" || descripcion.length === 0) {
        errores.push("La descripción no es una cadena o es un campo obligatorio.");
    }
    if (typeof thumbnail !== "string" || thumbnail.length === 0) {
        errores.push(
            "El enlace de la imagen no es una cadena o es un campo obligatorio."
        );
    }
    if (typeof price !== "number") {
        errores.push("El precio no es un número y es un campo obligatorio.");
    }
    if (typeof stock !== "number") {
        errores.push("El stock no es un número y es un campo obligatorio.");
    }
    if (errores.length > 0) {
        res.status(400).json({ error: errores });
    } else {
        next();
    }
};

export const logger = (req, res, next) => {
    console.log(
        `El método ${req.method} se hizo sobre la ruta ${
            req.originalUrl
        } a las ${new Date().toLocaleString()}`
    );
    next();
};