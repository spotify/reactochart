import React from 'react'

class PropsTable extends React.Component {

    renderTableCells = () => {
      let tableCells = this.props.items.map(function(item, index){
        return(
          <tr>
            <td><code>{item.name}</code></td>
            <td>{item.type}</td>
            <td>{item.description}</td>
          </tr>
        )
      })
      return tableCells
    }
    render() {
      return (
        <div>
          <h4>Props</h4>
          <table className="props-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>description</th>
              </tr>
            </thead>
            <tbody>
              {this.renderTableCells()}
            </tbody>
          </table>
        </div>
      )
    }
}

export default PropsTable
