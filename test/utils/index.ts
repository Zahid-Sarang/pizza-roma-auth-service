import { DataSource } from "typeorm";
import { Buffer } from "buffer";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }
    const part = token.split(".");
    if (part.length !== 3) {
        return false;
    }
    try {
        part.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
    } catch (error) {
        return false;
    }
};
