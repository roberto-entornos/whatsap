import React, { useState } from 'react';

function InputBox({ enviarMensaje }) {
    const [texto, setTexto] = useState("");

    const escribir = (e) => {
        setTexto(e.target.value);
    };

    const pulsarBoton = () => {
        if (texto !== "") {
            enviarMensaje(texto);
            setTexto("");
        }
    };

    return (
        <div className="bg-[#f0f2f5] p-3 flex items-center">
            <input
                type="text"
                className="flex-1 p-3 rounded-lg border-none outline-none mr-3 text-base"
                placeholder="Escribe un mensaje aquí"
                value={texto}
                onChange={escribir}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        pulsarBoton();
                    }
                }}
            />
            <button
                onClick={pulsarBoton}
                className="bg-[#008069] hover:bg-[#006b57] text-white border-none p-3 px-4 rounded-full font-bold cursor-pointer"
            >
                {">"}
            </button>
        </div>
    );
}

export default InputBox;
