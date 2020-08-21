import { HcComponent } from './component';
import { ElTableColumn } from 'element-ui/types/table-column'
// type PagingData = {
//   page: number;
//   total: number;
//   data: [];
// }
// interface IOptions {
//   pageKey: string;
//   pageSizeKey: string;
//   remotePipe(res: object, paging: object | boolean): PagingData | [];
// }
interface Columns extends ElTableColumn {
  children?: ElTableColumn
}
export declare class VTable extends HcComponent {
  columns: Columns
}