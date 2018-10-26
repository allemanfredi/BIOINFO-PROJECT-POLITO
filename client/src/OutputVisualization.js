import React, { Component } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Menu, Header, Button, Table } from "semantic-ui-react";

class OutputVisualization extends Component {
  constructor(props) {
    super(props); //proprietà passate ai componenti

    this.state = {
      //1: [MIM, TS, TC, MS, AS, IEX, I5P, IMS, ISN, I3P, INS, IOS, ISS, IPS, ICS, MSD],
      activeItem: "Statistics",
      logOutput: this.props.data.data.log,
      showPlot: false,
      chartOutput: this.props.data.data.alig,
      error: "",
      singleMIMATO: "",
      chartData: {
        labels: [
          "Perfect Match",
          "Iso5p",
          "Multiple Mismatch",
          "Single Mismatch",
          "Iso3p"
        ],
        datasets: [
          {
            label: "# of miRNA",
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
              "rgba(153, 102, 255, 0.8)",
              "rgba(255, 159, 64, 0.8)",
              "rgba(255, 99, 132, 0.8)"
            ],
            borderWidth: 1,
            borderColor: "#777",
            hoverBorderWidth: 3,
            hoverBorderColor: "#000",
            yAxisID: "l"
          },
          {
            type: "line",
            label: "Tag Count",
            data: [0, 0, 0, 0, 0, 0],
            yAxisID: "r",
            borderWidth: 1,
            borderColor: "#000",
            pointRadius: 4,
            pointHitRadius: 15 //il raggio che attiva l'etichetta se ci passi sopra col mouse
          }
        ]
      }
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    console.log(this.state.chartOutput);
  }

  logMessages = ["Load time of input files (Sec)", "Tags used for IsomiR-SEA alignment", "Tags discarded", "IsomiR-SEA alignment Time (Sec)", "Num Total Tag Seqs", "Num Total Reads Seqs", "Num Align Tag Seqs", "Num Align Mir Seqs", "Num Align Mir Seqs", "Num Align discarded Tag Seqs", "Num Align discarded Tag on PreMir Seqs", "Total Time (Sec)"];

  //handle the tab click
  handleItemClick(clickedItem, event) {
    console.log(clickedItem);
    this.setState({ activeItem: clickedItem });
  }

  handleChange(event){
    this.setState({singleMIMATO: event.target.value});
    event.preventDefault();
  }

  handleSubmit(event) {

    var id = this.state.singleMIMATO;
    //IEX, I5P, IMS, ISN, I3P
    //{isomiRType: [number, tagCount]}
    let chartData = { ...this.state.chartData};

    chartData.datasets[0].data = [0,0,0,0,0]; //values
    chartData.datasets[1].data = [0,0,0,0,0]; //tag
    var isMimato = false;
    this.setState({error: ""});

    for (let [key, value] of Object.entries(this.state.chartOutput)) {
      if(value[0] === id){
        isMimato = true;
        //exact
        if(value[5] === "T"){

          chartData.datasets[0].data[0] ++;
          chartData.datasets[1].data[0] += value[2];
        }
        else{
          //isomir 5p
          if(value[6] != 0){
            chartData.datasets[0].data[1] ++;
            chartData.datasets[1].data[1] += value[2];
          }
          //isomir multiple mismatch
          if(value[7] === "T"){
            chartData.datasets[0].data[2] ++;
            chartData.datasets[1].data[2] += value[2];
          }
          //isomir single mismatch
          if(value[8] === "T"){
            chartData.datasets[0].data[3] ++;
            chartData.datasets[1].data[3] += value[2];
          }
          //isomir 3p
          if(value[9] != 0){
            chartData.datasets[0].data[4] ++;
            chartData.datasets[1].data[4] += value[2];
          }
        }
      }
    }

    if(isMimato){
      this.setState({ chartData });
      this.setState({showPlot: true});
    }
    else{
      this.setState({error: "This id doesn't match"});
    }

    event.preventDefault();
  }

  renderMenu() {
    return (
      <Menu tabular size="large" style={{ marginBottom: "35px" }}>
        <Menu.Item
          name="Statistics"
          key="Statistics"
          active={this.state.activeItem === "Statistics"}
          onClick={this.handleItemClick.bind(this, "Statistics")}
        />
        <Menu.Item
          name="Charts"
          key="Charts"
          active={this.state.activeItem === "Charts"}
          onClick={this.handleItemClick.bind(this, "Charts")}
        />
      </Menu>
    );
  }

  renderLogTable(){
    return this.logMessages.map( (message, index) => {
      return(
      <Table.Row>
        <Table.Cell><b>{message}</b></Table.Cell>
        <Table.Cell>{this.state.logOutput[index+1]} </Table.Cell>
      </Table.Row>
      )
    });
  }

  render() {
    if (this.state.activeItem === "Statistics") {
      return (
        <div style={{ padding: "10px", marginTop: "20px" }} key="container">
          <Header
            as="h4"
            style={{
              width: "auto",
              marginRight: "20px",
              display: "inline-block"
            }}
          >
            You can either check the output statistics or play with plots in the
            other tab
          </Header>
          {this.renderMenu()}
          <Table singleLine key="teal" size="large">
          <Table.Body>
          {this.renderLogTable()}
          </Table.Body>
          </Table>
        </div>
      );
    } else {
      if(this.state.showPlot){
        return (
        <div style={{ padding: "10px", marginTop: "20px" }} key="container">
          {this.renderMenu()}
          <h5 style={ {fontColor: "red"} }>{this.state.error}</h5>
          <h5>Insert miRNA ID (ex MIMAT0000070)</h5>
            <form onSubmit={this.handleSubmit}>
                <input
                  type="text"
                  onChange={this.handleChange}
                />
              <Button
                type="Submit"
                value="Submit"
              >Plot</Button>
            </form>

          <Bar
            data={this.state.chartData}
            options={{
              title: {
                display: true,
                text: "Isoforms Distribution",
                fontSize: 25
              },
              layout: {
                padding: {
                  left: 50,
                  right: 0,
                  bottom: 0,
                  top: 0
                }
              },
              scales: {
                yAxes: [
                  {
                    id: "l",
                    position: "left",
                    scaleLabel: {
                      labelString: "# of miRNA",
                      display: true,
                      fontColor: "#000",
                      fontSize: 15,
                      padding: 20 //distanza dall'asse
                    }
                  },
                  {
                    id: "r",
                    position: "right",
                    scaleLabel: {
                      labelString: "Tag Count",
                      display: true,
                      fontColor: "#000",
                      fontSize: 15,
                      padding: 20
                    }
                  }
                ]
              }
            }}
          />
        </div>
      );
      }
      else{
        return (
        <div style={{ padding: "10px", marginTop: "20px" }} key="container">
          {this.renderMenu()}
          <h5 style={ {fontColor: "red"} }>{this.state.error}</h5>
          <h5>Insert miRNA ID (ex MIMAT0000070)</h5>
            <form onSubmit={this.handleSubmit}>
                <input
                  type="text"
                  onChange={this.handleChange}
                />
              <Button
                type="Submit"
                value="Submit"
              >Plot</Button>
            </form>
          </div>
        );
      }
    }
  }
}

export default OutputVisualization;