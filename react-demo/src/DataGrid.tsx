import "@handsontable/pikaday/css/pikaday.css";
import "./styles.css";
import { HotTable, HotColumn } from "@handsontable/react";
import { data, emptyData } from "./constants";
import { ProgressBarRenderer } from "./renderers/ProgressBar";
import { StarsRenderer } from "./renderers/Stars";
import _ from 'lodash';

import {
  drawCheckboxInRowHeaders,
  addClassesToRows,
  changeCheckboxCell
} from "./hooksCallbacks";

import "handsontable/dist/handsontable.css";
import { useState } from "react";

const DataGrid = () => {
  const [grid2Data, setGrid2Data] = useState<(string | number | boolean)[][]>(emptyData);
  const isRtl = document.documentElement.getAttribute('dir') === 'rtl';

  const handleOnAfterPaste = (pasteData: any, coods: any) => {
    if (coods[0].startCol === 0) {
      const cellValue = pasteData[0][0];
  
      const rowData = _.find(data, (row) => row[1] === cellValue);
      if (!rowData) {
        console.error('No matching row found');
        return;
      }
  
      const newData = [rowData[0], rowData[1], rowData[2], rowData[3], rowData[4], rowData[5], rowData[6], rowData[7], rowData[8]];
      grid2Data[coods[0]['startRow']] = newData;
  
      setGrid2Data([...grid2Data]);
    }
  };

  return (
    <div>
      <HotTable
				style={{ margin: '30px', border: '1px solid #ccc' }}
        data={data}
        height={450}
				width={1150}
        colWidths={[140, 192, 100, 90, 90, 110, 97, 100, 126]}
        colHeaders={[
          "Company name",
          "Name",
          "Sell date",
          "In stock",
          "Qty",
          "Progress",
          "Rating",
          "Order ID",
          "Country"
        ]}
        dropdownMenu={true}
        hiddenColumns={{
          indicators: true
        }}
        contextMenu={true}
        multiColumnSorting={true}
        filters={true}
        rowHeaders={true}
        headerClassName={isRtl ? "htRight" : "htLeft"}
        beforeRenderer={addClassesToRows}
        afterGetRowHeader={drawCheckboxInRowHeaders}
        afterOnCellMouseDown={changeCheckboxCell}
        mergeCells={true}
        manualRowMove={true}
        navigableHeaders={true}
        comments={true}
        manualColumnMove={true}
        customBorders={true}
        licenseKey="non-commercial-and-evaluation"
      >
        <HotColumn data={1} />
        <HotColumn data={3} />
        <HotColumn data={4} type="date" allowInvalid={false} />
        <HotColumn data={6} type="checkbox" className="htCenter" headerClassName="htCenter" />
        <HotColumn data={7} type="numeric" headerClassName="htRight" />
        <HotColumn data={8} readOnly={true} className="htMiddle">
          <ProgressBarRenderer hot-renderer />
        </HotColumn>
        <HotColumn data={9} readOnly={true} className="htCenter" headerClassName="htCenter">
          <StarsRenderer hot-renderer />
        </HotColumn>
        <HotColumn data={5} />
        <HotColumn data={2} />
      </HotTable>
      <HotTable
				style={{ margin: '30px', border: '1px solid #ccc' }}
        data={grid2Data}
        height={450}
				width={1150}
        colWidths={[140, 192, 100, 90, 90, 110, 192]}
        colHeaders={[
          "Company name",
          "Name",
          "In stock",
          "Qty",
          "Progress",
          "Order ID",
          "Country"
        ]}
        afterPaste={ handleOnAfterPaste }
        dropdownMenu={true}
        hiddenColumns={{
          indicators: true
        }}
        contextMenu={true}
        multiColumnSorting={true}
        filters={true}
        rowHeaders={true}
        headerClassName={isRtl ? "htRight" : "htLeft"}
        beforeRenderer={addClassesToRows}
        afterGetRowHeader={drawCheckboxInRowHeaders}
        afterOnCellMouseDown={changeCheckboxCell}
        mergeCells={true}
        manualRowMove={true}
        navigableHeaders={true}
        comments={true}
        manualColumnMove={true}
        customBorders={true}
        licenseKey="non-commercial-and-evaluation"
      >
        <HotColumn data={1} />
        <HotColumn data={3} />
        <HotColumn data={6} type="checkbox" className="htCenter" headerClassName="htCenter" />
        <HotColumn data={7} type="numeric" headerClassName="htRight" />
        <HotColumn data={8} readOnly={true} className="htMiddle">
          <ProgressBarRenderer hot-renderer />
        </HotColumn>
        <HotColumn data={5} />
        <HotColumn data={2} />
      </HotTable>
    </div>
  );
}

export default DataGrid;
