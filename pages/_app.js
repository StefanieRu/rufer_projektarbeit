import {
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { VegaLite } from "react-vega";

export default function App() {
  const [standort, setStandort] = useState([]);
  const [standortgef, setStandortgef] = useState([1]);
  const [daten, setDaten] = useState([]);
  const [datengef, setDatengef] = useState([]);
  const [parameter, setParameter] = useState("T");
  const [spec, setSpec] = useState(null);
  const [diagramm, setDiagramm] = useState(false);

  useEffect(() => {
    axios
      .get("/api/py/daten")
      .then((response) => {
        const JSONDaten = response.data;
        console.log(JSONDaten);

        const JSONStandorte = [
          ...new Set(JSONDaten.map((item) => item.Standortname)),
        ];

        setDaten(JSONDaten);
        setDatengef(JSONDaten);
        setStandort(JSONStandorte);
        setStandortgef(JSONStandorte[1]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const newDatengef = daten.filter(
      (item) => item.Standortname === standortgef
    );
    setDatengef(newDatengef);
  }, [standortgef, daten]);

  function getParameterTitle(parameter) {
    const parameterTitel = {
      RainDur: "Regendauer in min",
      T: "Temperatur in °C",
      T_max_h1: "Maximaltemperatur in °C",
      p: "Luftdruck in hPa",
    };
    return parameterTitel[parameter];
  }

  function createspec() {
    return {
      title: standortgef + " " + getParameterTitle(parameter),
      width: 600,
      height: 400,
      data: { values: datengef },
      encoding: {
        x: {
          field: "Datum",
          type: "temporal",
          title: "Jahr 2023 [Monat]",
          scale: {
            domain: [
              Math.min(...datengef.map((event) => event.Datum)),
              Math.max(...datengef.map((event) => event.Datum)),
            ],
          },
          timeUnit: "yearmonthdatehours",
          axis: { labelExpr: "timeFormat(datum.value, '%m')" },
        },
        y: {
          field: parameter,
          type: "quantitative",
          title: getParameterTitle(parameter),
        },
      },
      mark: "line",
    };
  }

  return (
    <>
      <Typography variant="h4">Wetterdaten Zürich 2023</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div style={{ marginLeft: "15px", marginTop: "30px" }}>
          <FormControl sx={{ width: 250 }}>
            <InputLabel id="standort-select-label">Standort </InputLabel>
            <Select
              id="standort-select"
              value={standortgef}
              label="Standort"
              onChange={(e) => setStandortgef(e.target.value)}
            >
              {standort.map((standort) => (
                <MenuItem key={standort} value={standort}>
                  {standort}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div style={{ marginLeft: "15px", marginTop: "15px" }}>
          <FormControl sx={{ width: 250 }}>
            <InputLabel id="parameter-select-label">Parameter</InputLabel>
            <Select
              labelId="parameter-select-label"
              id="parameter-select"
              value={parameter}
              label="Parameter"
              onChange={(event) => setParameter(event.target.value)}
            >
              <MenuItem value={"RainDur"}>Regendauer</MenuItem>
              <MenuItem value={"T"}>Temperatur</MenuItem>
              <MenuItem value={"T_max_h1"}>Maximaltemperatur</MenuItem>
              <MenuItem value={"p"}>Luftdruck</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div style={{ marginLeft: "15px", marginTop: "15px" }}>
          <Button
            variant="contained"
            onClick={() => {
              setSpec(createspec());
              setDiagramm(true);
            }}
            disabled={!parameter || !datengef.length}
          >
            Diagramm erstellen
          </Button>
        </div>
        <div style={{ marginLeft: "15px", marginTop: "50px" }}>
          {diagramm && spec && <VegaLite spec={spec} />}
        </div>
      </div>
    </>
  );
}
