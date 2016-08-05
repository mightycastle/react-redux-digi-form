import React, {
  Component,
  PropTypes
} from 'react';
import {
  DateCell,
  ActionsHeaderCell,
  ActionsCell
} from '../CustomCells/CustomCells';
import {
  MenuItem,
  DropdownButton
} from 'react-bootstrap';
import { formsUrl } from 'helpers/urlHelper';
import GriddleTable from 'components/GriddleComponents/GriddleTable';
import Pagination from '../../containers/PaginationContainer';

import styles from './FormsListView.scss';

class FormsListView extends Component {
  static propTypes = {
    /*
     * isFetching: Redux state that indicates whether the requested form is being fetched from backend
     */
    isFetching: PropTypes.bool.isRequired,

    /*
     * forms: Redux state that indicates whether the requested form is being fetched from backend
     */
    forms: PropTypes.array.isRequired,

    /*
     * fetchFormsList: Redux action to fetch form from backend with ID specified by request parameters
     */
    fetchFormsList: PropTypes.func.isRequired,

    /*
     * page: Current page number
     */
    page: PropTypes.number.isRequired,

    /*
     * pageSize: Number of items per page.
     */
    pageSize: PropTypes.number.isRequired,

    /*
     * totalCount: Total number of items from backend.
     */
    totalCount: PropTypes.number.isRequired,

    /*
     * goTo: Redux action to go to specific url.
     */
    goTo: PropTypes.func.isRequired,

    /*
     * sortColumn: Column ID to sort by.
     */
    sortColumn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]).isRequired,

    /*
     * sortAscending: true if ascending, false if descending
     */
    sortAscending: PropTypes.bool.isRequired,

    /*
     * selectAllItems: Redux action to select all the rows in table
     */
    selectAllItems: PropTypes.func.isRequired,

    /*
     * toggleSelectItem: Redux action to select or deselect item by id.
     */
    toggleSelectItem: PropTypes.func.isRequired,

    /*
     * selectedItems: Redux state in array to hold selected item ids.
     */
    selectedItems: PropTypes.array.isRequired
  };

  get columnMetadata() {
    const {
      selectAllItems,
      forms,
      selectedItems,
      toggleSelectItem
    } = this.props;
    return [
      {
        columnName: 'id',
        order: 1,
        locked: false,
        visible: true,
        displayName: 'ID',
        cssClassName: styles.columnID
      },
      {
        columnName: 'title',
        order: 2,
        locked: false,
        visible: true,
        displayName: 'Name',
        cssClassName: styles.columnName
      },
      {
        columnName: 'author',
        order: 3,
        locked: false,
        visible: true,
        displayName: 'Created by',
        cssClassName: styles.columnCreatedBy
      },
      {
        columnName: 'created',
        order: 4,
        locked: false,
        visible: true,
        displayName: 'Created',
        customComponent: DateCell,
        cssClassName: styles.columnCreated
      },
      {
        columnName: 'status',
        order: 5,
        locked: false,
        visible: true,
        displayName: 'Status',
        cssClassName: styles.columnStatus
      },
      {
        columnName: 'slug',
        locked: true,
        visible: false
      },
      {
        columnName: 'actions',
        order: 6,
        locked: true,
        sortable: false,
        displayName: '',
        customHeaderComponent: ActionsHeaderCell,
        customComponent: ActionsCell,
        selectedItems,
        toggleSelectItem,
        customHeaderComponentProps: {
          selectAllItems,
          isAllSelected: forms.length === selectedItems.length
        }
      }
    ];
  }

  handleNewForm = () => {
    const { goTo } = this.props;
    goTo(formsUrl('new'));
  }

  renderActions() {
    return (
      <div className={styles.actionsWrapper}>
        <DropdownButton pullRight bsSize="small"
          className={styles.actionsButton}
          id="formListActions"
          title="Quick actions">
          <MenuItem onClick={this.handleNewForm}>New Form</MenuItem>
        </DropdownButton>
      </div>
    );
  }

  renderFormsList() {
    const {
      isFetching,
      forms,
      page,
      pageSize,
      sortColumn,
      sortAscending,
      fetchFormsList,
      totalCount
    } = this.props;
    return (
      <GriddleTable
        results={forms}
        columnMetadata={this.columnMetadata}
        fetchList={fetchFormsList}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        sortColumn={sortColumn}
        sortAscending={sortAscending}
        Pagination={Pagination}
        initialSort="id"
        isFetching={isFetching}
      />
    );
  }

  render() {
    return (
      <div className={styles.formsList}>
        <div className={styles.formsListInner}>
          {this.renderActions()}
          {this.renderFormsList()}
          }
        </div>
      </div>
    );
  }
}

export default FormsListView;
