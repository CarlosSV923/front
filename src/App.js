import imgSubir from "./assets/subir.svg";
import React, { useCallback, useState, useEffect } from "react";
import loadingImagen from "./assets/engranaje2.gif";
import { motion } from "framer-motion";

import "./App.css";
import "./chart.scss";

import { useDropzone } from "react-dropzone";

function App() {
  const [file, setFile] = useState();
  const [loading, setLoading] = useState();
  const [resultado, setResultado] = useState();
  const [mensaje, setMensaje] = useState();

  useEffect(() => {
    setInterval(() => {
      setMensaje();
    }, 10000);
  }, [mensaje]);

  var formData = new FormData();
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length) setMensaje("Archivo no compatible");
    setFile(acceptedFiles[0]);
  }, []);

  const limpiar = () => {
    setFile();
    setResultado();
  };
  const procesar = () => {
    if (!file) {
      return setMensaje("Escoja una imagen");
    }
    setLoading(true);
    formData.append("img", file);

    fetch("http://3.83.206.123:8080/predict", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setLoading(false);
        if (data && data.porcentaje && data.label) {
          setResultado(data);
        } else {
          setMensaje("Error del servidor");
        }
      })
      .catch((error) => {
        setLoading(false);
        setMensaje("Ha ocurrido un error");
      });
  };
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: "image/jpeg",
  });

  return (
    <div className="App">
      <div className="App-header">
        <motion.div
          animate={{ height: resultado ? 80 : 590 }}
          className={resultado ? "card card-min" : "card"}
        >
          {!resultado ? (
            <>
              <div className="drag" {...getRootProps()}>
                <img
                  src={
                    file
                      ? Object.assign(file, {
                          preview: URL.createObjectURL(file),
                        }).preview
                      : imgSubir
                  }
                  className="preview"
                  alt="preview"
                />

                {file ? (
                  <p>{file.name}</p>
                ) : (
                  <p>Arrastre una imagen para detectar si hay o no hay fuego</p>
                )}
              </div>
              <div className=" botones">
                <button className="btn cargar" onClick={open}>
                  <input {...getInputProps()} />
                  Cargar imagen
                </button>
                <button className="btn procesar" onClick={procesar}>
                  Procesar
                </button>
              </div>
            </>
          ) : (
            <>
              <img
                src={
                  file
                    ? Object.assign(file, {
                        preview: URL.createObjectURL(file),
                      }).preview
                    : imgSubir
                }
                className="preview-min"
                alt="foto"
              />
              <button className="btn cargar cargar-mini" onClick={limpiar}>
                Cargar nueva imagen
              </button>
            </>
          )}
        </motion.div>
        {loading && (
          <div className="loading">
            <img src={loadingImagen} alt="loadingImagen" />
            <p>Estamos procesando la imagen</p>
          </div>
        )}
        {resultado && (
          <div className="card resultado set-size charts-container">
            <div className="pie-wrapper  style-2">
              <span className="label">
                {(resultado.porcentaje + "    ").slice(0, 4)}
                <span className="smaller">%</span>
              </span>
              <p className="fuego">{resultado.label}</p>
              <div
                className={
                  resultado.porcentaje > 50 ? "pie pie-more-50" : "pie"
                }
              >
                <motion.div
                  animate={{
                    transform: `rotate(${resultado.porcentaje * 3.6}deg)`,
                  }}
                  transition={{ duration: 2 }}
                  className="left-side half-circle"
                ></motion.div>
                <div
                  className={
                    resultado.porcentaje > 50
                      ? "right-side right-side-more-50  half-circle"
                      : "right-side right-side-less-50 half-circle"
                  }
                ></div>
              </div>
              <div className="shadow"></div>
            </div>
          </div>
        )}
        {mensaje && (
          <div className="card mensaje">
            <i class="fas fa-exclamation-triangle"></i>
            <p className="mensaje-text">{mensaje}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
