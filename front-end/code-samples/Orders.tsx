import { removeQueryParams } from '@virtus/common/utils/router/removeQueryParams';
import { ILayout } from '@virtus/components/DxDataGrid/templates/Layouts/Layouts';
import { GlideDataSource } from '@virtus/components/DxDataGrid/utils/mapSchemaGlide';
import { CartWithCounter } from '@virtus/components/icons';
import Loading from '@virtus/components/Loading';
import { LoadingIconGlide } from '@virtus/components/LoadingIcon';
import { LoadingIconSizes, LoadingIconType } from '@virtus/components/LoadingIcon/LoadingIcon';
import Notification, { NotificationMessageStyle } from '@virtus/components/Notification';
import { PageProps } from '@virtus/components/page/Page/Page';
import { ToolBarProps } from '@virtus/components/src/tool-bar/tool-bar';
import * as queryString from 'query-string';
import React, { useEffect, useReducer, useRef } from 'react';
import { connect } from 'react-redux';
import { updateEntities } from 'redux-query';
import { requestAsync } from 'redux-query/advanced';
import { FundAllocations, Order } from 'src/api/mutations';
import { OrderBlotter, OrderDisplayView } from 'src/api/queries';
import { AuthContext } from 'src/app/App/AuthenticationHandlerGlide';
import { store } from 'src/app/store';
import AddToScenarioInspector from 'src/components/add-to-scenario-inspector';
import { useCart } from 'src/components/CartInspector/hooks/useCartInspector';
import { SelectedRowDataType, SelectionChangeData } from 'src/components/DxGridSelection';
import { GlideLayoutManagerInspector } from 'src/components/GlideLayoutManagerInspector/GlideLayoutManagerInspector';
import OrderInspector from 'src/components/OrderInspector/OrderInspector';
import { NavigationProps } from 'src/components/PageWrapper';
import { ViewsWrapper } from 'src/components/PageWrapper/components/ViewsWrapper/ViewsWrapper';
import { useViews, Views } from 'src/components/PageWrapper/hooks/useViews';
import PageWrapper from 'src/components/PageWrapper/PageWrapper';
import { LayoutsProvider } from 'src/contexts/layouts/layouts.context';
import { RootState } from 'src/reducers/rootReducer';
import { ActionAuthParams } from 'src/utils/action-resolver';
import { removeSelectedRowStyle } from 'src/utils/DxGridRows';
import HyposView from './views/Hypos';
import { OrderBlotterView } from './views/OrderBlotter/OrderBlotter';

export interface ReduxProps {
  readonly orders: GlideDataSource;
  readonly hypos: GlideDataSource;
  readonly orderDetails: any;
  readonly isLoadingOrderDetails: boolean;
  readonly isLoadingOrders: boolean;
  readonly isLoadingHypos: boolean;
  readonly isUpdatingOrder: boolean;
  readonly isUpdatingFundAllocations: boolean;
}

export interface ReduxDispatch {
  getOrderDetailsAction: (uri: string, issuerName: string, fetch_options: string) => any;
  getOrdersAction: () => any;
  getHyposRequest: () => any;
  updateOrderAction: (orderData: { [key: string]: any }) => void;
  updateFundAllocationsAction: (fundAllocationsData: { [key: string]: any }) => void;
}

export type Props = NavigationProps & ReduxProps & ReduxDispatch;

interface IAssetsState {
  showOrderInspector: boolean;
  showAddToScenarioInspector: boolean;
  showLayoutManagerInspector: boolean;
  inspectorVisible: boolean;
  isOrderSubmitted: boolean;
  orderData: {
    uri: string;
    issuerName: string;
    fetch_options: string;
  };
}

const initialState: IAssetsState = {
  showOrderInspector: false,
  showAddToScenarioInspector: false,
  showLayoutManagerInspector: false,
  inspectorVisible: false,
  isOrderSubmitted: false,
  orderData: {
    uri: '',
    issuerName: '',
    fetch_options: 'styles,workflow_transitions,edit',
  },
};

enum ActionTypes {
  SHOW_ORDER_DETAILS,
  CLOSE_INSPECTOR,
  TOGGLE_CART,
  OPEN_LAYOUT_MANAGER_INSPECTOR,
  CLOSE_LAYOUT_MANAGER_INSPECTOR,
  ORDER_SUBMITTED,
  ORDER_NOT_SUBMITTED,
}

const reducer = (state: IAssetsState, action: { type: ActionTypes; payload?: any }) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_CART:
      const nextShowAddtoScenarioInspector = !state.showAddToScenarioInspector;
      return {
        ...state,
        showAddToScenarioInspector: nextShowAddtoScenarioInspector,
        showOrderInspector: false,
        inspectorVisible: nextShowAddtoScenarioInspector,
      };
    case ActionTypes.SHOW_ORDER_DETAILS:
      return {
        ...state,
        showOrderInspector: true,
        inspectorVisible: true,
        orderData: { ...state.orderData, ...action.payload.orderData },
      };
    case ActionTypes.OPEN_LAYOUT_MANAGER_INSPECTOR:
      return { ...state, showLayoutManager: true, inspectorVisible: true };
    case ActionTypes.CLOSE_LAYOUT_MANAGER_INSPECTOR:
      return { ...state, inspectorVisible: true, showLayoutManager: false };
    case ActionTypes.CLOSE_INSPECTOR:
      return {
        ...state,
        inspectorVisible: false,
        showOrderInspector: false,
        showLayoutManager: false,
        showAddToScenarioInspector: false,
      };
    case ActionTypes.ORDER_SUBMITTED:
      return { ...state, isOrderSubmitted: true };
    case ActionTypes.ORDER_NOT_SUBMITTED:
      return { ...state, isOrderSubmitted: false };

    default:
      return state;
  }
};

const Orders: React.FunctionComponent<Props> = ({
  orders,
  hypos,
  getOrdersAction,
  getOrderDetailsAction,
  updateOrderAction,
  updateFundAllocationsAction,
  orderDetails,
  isLoadingOrders,
  isLoadingHypos,
  isLoadingOrderDetails,
  isUpdatingOrder,
  isUpdatingFundAllocations,
  getHyposRequest,
  path,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const parameters = queryString.parse(location.search);
  const dataGridRef = useRef(null);
  const pageProps: Partial<PageProps> = { pageTitle: 'Orders', testid: 'page-orders' };
  const pageToolBarProps: Partial<ToolBarProps> = { active: path };
  const { assets, setAssets } = useCart({
    dataGridRef,
  });

  const updateOrderStatusInTable = () => {
    // update order table
    if (orders?.data && orderDetails?.data) {
      const orderIndex = orders.data.findIndex((order: any) => order._uri === orderDetails.uri);
      let loanOrderStatus;
      // order details is populated via groups so it's a bit tedious but should work with clients
      orderDetails.data['Order Info'].forEach((order: any) => {
        if (order.display_name === 'Loan Order Status') {
          loanOrderStatus = order.value;
        }
      });
      if (loanOrderStatus && orders?.data[orderIndex] && orders?.data[orderIndex]['Order Status']) {
        orders.data[orderIndex]['Order Status'] = loanOrderStatus;
        store.dispatch(updateEntities({ orderBlotter: () => orders }));
      }
    }
  };

  useEffect(() => {
    updateOrderStatusInTable();
  }, [orderDetails]);

  useEffect(() => {
    getOrdersAction();
  }, []);

  const closeInspector = () => {
    // Remove selected style for selected row
    removeSelectedRowStyle();
    dispatch({ type: ActionTypes.CLOSE_INSPECTOR });
  };

  const onRefreshTable = (view: 'order' | 'hypos') => {
    if (view === 'order') {
      getOrdersAction();
    }
    if (view === 'hypos') {
      getHyposRequest();
    }
  };

  const onShowDetails = ({ rowData }: { rowData: SelectedRowDataType }) => {
    console.log('On show details', rowData);
    if (!rowData) return;
    const uri = rowData._uri;
    const issuerName = rowData['Virtus Issuer Name'];
    dispatch({
      type: ActionTypes.SHOW_ORDER_DETAILS,
      payload: { orderData: { uri, issuerName } },
    });
    getOrderDetailsAction(uri, issuerName as string, state.orderData.fetch_options);
  };

  const onSelectionChanged = ({ selectedRowsData }: SelectionChangeData) => {
    const nextSelectedOrders = selectedRowsData.map(rowData => ({
      'Glide ID': rowData['Glide ID'] as string,
      _uri: rowData._uri as string,
      id: rowData.id as number,
    }));
    setAssets(nextSelectedOrders);
    if (activeViewKey === 'blotter' || parameters.uri) {
      onShowDetails({ rowData: selectedRowsData[0] });
    }
    if (parameters.uri) {
      removeQueryParams();
    }
  };

  const onCartClick = () => dispatch({ type: ActionTypes.TOGGLE_CART });

  const onSettingsClick = () => dispatch({ type: ActionTypes.OPEN_LAYOUT_MANAGER_INSPECTOR });

  const { onClickTab, activeViewKey } = useViews({
    initialActiveViewKey: (parameters.activeView as string) || 'blotter',
  });

  const onSubmitOrderInspector = (data: { order: { [key: string]: string }; allocations: any }) => {
    const updatedOrderData = { [`${state.orderData.uri}`]: { ...data.order } };
    const thereAreAllocationChanges = Object.keys(data.allocations).length > 0;
    const thereAreOrderChanges = Object.keys(data.order).length > 0;
    if (thereAreAllocationChanges) {
      updateFundAllocationsAction(data.allocations);
    }
    if (thereAreOrderChanges) {
      updateOrderAction(updatedOrderData);
    }
  };

  const onCloseLayoutManagerInspector = () => dispatch({ type: ActionTypes.CLOSE_LAYOUT_MANAGER_INSPECTOR });

  const renderInspector = (actionAuth: ActionAuthParams) => {
    if (!state.inspectorVisible) return null;

    if (state.showLayoutManagerInspector) {
      return (
        <GlideLayoutManagerInspector
          onShare={(rowElement: ILayout) => console.log('On Share', rowElement)}
          closeInspector={onCloseLayoutManagerInspector}
        />
      );
    }
    if (state.showAddToScenarioInspector) {
      return <AddToScenarioInspector assets={assets} onCloseInspector={closeInspector} actionAuth={actionAuth} />;
    }

    if (state.showOrderInspector) {
      return (
        <OrderInspector
          onSubmit={onSubmitOrderInspector}
          orderUri={state.orderData.uri}
          orderDetails={orderDetails}
          actionAuth={actionAuth}
          loading={isLoadingOrderDetails}
          onCloseInspector={closeInspector}
        />
      );
    }
    return null;
  };

  const handleOnClickTab = (tab: string) => {
    if (dataGridRef && dataGridRef.current) {
      (dataGridRef as any).current.instance.selectRows([]);
    }
    onClickTab(tab);
  };

  return (
    <AuthContext.Consumer>
      {(actionAuth: any) => (
        <LayoutsProvider viewUri="order_trades_blotter" dataGridRef={dataGridRef}>
          <PageWrapper
            pageProps={pageProps}
            pageToolBarProps={pageToolBarProps}
            showInspector={state.inspectorVisible}
            closeInspector={closeInspector}
            inspector={renderInspector(actionAuth)}
            onClickTab={handleOnClickTab}
            views={{ blotter: 'Order Blotter', hypos: 'Hypos' }}
            activeViewKey={activeViewKey}
            extraIconButtons={
              activeViewKey === 'hypos'
                ? [
                    {
                      testId: 'cart-button',
                      onClick: onCartClick,
                      Icon: CartWithCounter,
                      iconProps: { counter: assets.length },
                    },
                  ]
                : undefined
            }
            render={({ notification }) => {
              if (isLoadingOrders || isLoadingHypos) {
                return (
                  <Loading
                    type={LoadingIconType.Glide}
                    size={LoadingIconSizes.large}
                    show={true}
                    text={`Loading ${isLoadingOrders ? 'Orders' : 'Hypos'}...`}
                    full
                  />
                );
              }

              const OrderViews: Views = {
                blotter: () => (
                  <OrderBlotterView
                    onSettingsClick={onSettingsClick}
                    orders={orders}
                    onRefresh={() => onRefreshTable('order')}
                    selectedUriByUrl={parameters.uri}
                    orderDetailsData={state.orderData}
                    onShowDetails={onShowDetails}
                    onSelectionChangedCb={onSelectionChanged}
                    isUpdatingOrder={isUpdatingOrder}
                    isLoadingOrders={isLoadingOrders}
                    isUpdatingFundAllocations={isUpdatingFundAllocations}
                    getOrderDetailsAction={getOrderDetailsAction}
                    getOrdersAction={getOrdersAction}
                  />
                ),
                hypos: () => (
                  <HyposView
                    onSettingsClick={onSettingsClick}
                    dataGridRef={dataGridRef}
                    orders={hypos}
                    onRefresh={() => onRefreshTable('hypos')}
                    onCartClick={onCartClick}
                    onSelectionChanged={onSelectionChanged}
                    onShowDetails={onShowDetails}
                    selectedUriByUrl={parameters.uri}
                    dropdownSelector={{
                      text: 'Add to scenario',
                      onTextClick: onCartClick,
                    }}
                    getHyposRequest={getHyposRequest}
                  />
                ),
              };

              const isUpdating = isUpdatingOrder || isUpdatingFundAllocations;

              return (
                <>
                  <ViewsWrapper notification={notification}>{OrderViews[activeViewKey]()}</ViewsWrapper>
                  {(state.isOrderSubmitted || isUpdatingOrder || isUpdatingFundAllocations) && (
                    <Notification
                      bottom
                      right
                      style={{ bottom: '70px' }}
                      notification={{
                        id: 'message-id',
                        ofType: NotificationMessageStyle.normal,
                        title: 'Order',
                        message: '',
                      }}
                      close={() => dispatch({ type: ActionTypes.ORDER_NOT_SUBMITTED })}
                    >
                      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <LoadingIconGlide size="small" show={isUpdating} />
                        <span style={{ width: '100%', marginLeft: isUpdating ? '5px' : '0' }}>
                          {isUpdatingOrder
                            ? 'Saving order ...'
                            : isUpdatingFundAllocations
                            ? 'Saving fund allocations ...'
                            : 'Saved suscessfully'}
                           
                        </span>
                      </div>
                    </Notification>
                  )}
                </>
              );
            }}
          />
        </LayoutsProvider>
      )}
    </AuthContext.Consumer>
  );
};

const mapStateToProps = (state: RootState): ReduxProps => ({
  orders: OrderBlotter.selectorOrders(state) || { webLayouts: [] },
  hypos: OrderBlotter.selectorHypos(state) || { webLayouts: [] },
  orderDetails: OrderDisplayView.selector(state) || {},
  isLoadingOrderDetails: OrderDisplayView.pending(state),
  isLoadingOrders: OrderBlotter.pendingOrders(state),
  isLoadingHypos: OrderBlotter.pendingHypos(state),
  isUpdatingOrder: Order.pending(state),
  isUpdatingFundAllocations: FundAllocations.pending(state),
});

const mapDispatchToProps = (dispatch: any): ReduxDispatch => ({
  getOrdersAction: () => dispatch(requestAsync(OrderBlotter.getOrders())),
  getHyposRequest: () => dispatch(requestAsync(OrderBlotter.getHypos())),
  getOrderDetailsAction: (uri: string, issuerName: string, fetch_options: string) => {
    store.dispatch(
      updateEntities({
        orderDisplayView: () => ({ displayName: issuerName }),
      }),
    );
    dispatch(requestAsync(OrderDisplayView.get(uri, fetch_options)));
  },
  updateOrderAction: (orderData: { [key: string]: any }) => dispatch(requestAsync(Order.put(orderData))),
  updateFundAllocationsAction: (fundAllocationsData: { [key: string]: any }) =>
    dispatch(requestAsync(FundAllocations.post(fundAllocationsData))),
});

export default connect(mapStateToProps, mapDispatchToProps)(Orders);

