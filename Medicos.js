import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

export default function Medicos() {
  const medicos = [
    {
      nome: "Dra. Mariana Costa",
      especialidade: "Ginecologia",
      crm: "321789-SP",
      contato: "(11) 96666-4444",
      convenios: "Unimed, Particular",
      horario: "Ter a Sex — 10h às 18h",
      //imagem: require("./assets/medicos/mariana.png"),
    },
    {
      nome: "Dr. Pedro Almeida",
      especialidade: "Cardiologia",
      crm: "123456-SP",
      contato: "(11) 99999-1111",
      convenios: "Unimed, Amil, Particular",
      horario: "Seg a Sex — 09h às 17h",
      //imagem: require("./assets/medicos/pedro.png"),
    },
    {
      nome: "Dr. Lucas Mendes",
      especialidade: "Ortopedia",
      crm: "987654-SP",
      contato: "(11) 97777-3333",
      convenios: "Bradesco Saúde, Amil, Particular",
      horario: "Seg a Qui — 12h às 20h",
      //imagem: require("./assets/medicos/lucas.png"),
    },
    {
      nome: "Dra. Ana Souza",
      especialidade: "Pediatria",
      crm: "654321-SP",
      contato: "(11) 98888-2222",
      convenios: "SulAmérica, Unimed, Particular",
      horario: "Seg a Sex — 08h às 14h",
      //imagem: require("./assets/medicos/ana.png"),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MÉDICOS</Text>

      <View style={styles.grid}>
        {medicos.map((m, index) => (
          <View key={index} style={styles.card}>
            <Image source={m.imagem} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{m.nome}</Text>
              <Text style={styles.text}>• Especialidade: {m.especialidade}</Text>
              <Text style={styles.text}>• CRM: {m.crm}</Text>
              <Text style={styles.text}>• Contato: {m.contato}</Text>
              <Text style={styles.text}>• Convênios: {m.convenios}</Text>
              <Text style={styles.text}>• Horário: {m.horario}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    color: "#000",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 10,
    backgroundColor: "#eaf9f9",
  },
  info: {
    flexShrink: 1,
  },
  name: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    color: "#333",
  },
});
