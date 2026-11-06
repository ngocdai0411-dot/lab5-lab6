import React, { createContext, useEffect, useState } from "react";
import instance from "../utils";

export const BoxProvider = createContext();

export const ContextProvider = ({ children }) => {
    const [ListSubjects, setListSubjects] = useState([]);

    // Call api và lấy ra dữ liệu subjects
    useEffect(() => {
        instance
            .get("/subjects")
            .then((res) => {
                setListSubjects(res.data);
            })
            .catch((err) => {
                console.error("Lỗi khi tải subjects trong context:", err);
            });
    }, []);

    return (
        <BoxProvider.Provider value={{ ListSubjects, setListSubjects }}>
            {children}
        </BoxProvider.Provider>
    );
};

export default ContextProvider;
