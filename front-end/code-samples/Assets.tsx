import { ILayout } from '@virtus/components/DxDataGrid/templates/Layouts/Layouts';
import { CartWithCounter } from '@virtus/components/icons';
import Loading from '@virtus/components/Loading';
import { LoadingIconSizes, LoadingIconType } from '@virtus/components/LoadingIcon/LoadingIcon';
import { PageProps } from '@virtus/components/page/Page/Page';
import { ToolBarProps } from '@virtus/components/src/tool-bar/tool-bar';
import * as queryString from 'query-string';
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { updateEntities } from 'redux-query';
import { requestAsync } from 'redux-query/advanced';
import { ActionArguments, ClientUniverse, SearchAssets } from 'src/api/queries';
import { AuthContext } from 'src/app/App/AuthenticationHandlerGlide';
import { store } from 'src/app/store';
import CartInspector from 'src/components/CartInspector';
import { useCart } from 'src/components/CartInspector/hooks/useCartInspector';
import { SelectedRowDataType, SelectionChangeData, SelectionModeType } from 'src/components/DxGridSelection';
import { GlideLayoutManagerInspector } from 'src/components/GlideLayoutManagerInspector/GlideLayoutManagerInspector';
import InstrumentInspector from 'src/components/InstrumentInspector';
import { ViewsWrapper } from 'src/components/PageWrapper/components/ViewsWrapper/ViewsWrapper';
import { useViews, Views } from 'src/components/PageWrapper/hooks/useViews';
import PageWrapper from 'src/components/PageWrapper/PageWrapper';
import { LayoutsProvider } from 'src/contexts/layouts/layouts.context';
import { FormType } from 'src/models/order/forms.model';
import { RootState } from 'src/reducers/rootReducer';
import { ActionAuthParams } from 'src/utils/action-resolver';
import { removeSelectedRowStyle } from 'src/utils/DxGridRows';
import { Props, ReduxDispatch, ReduxProps } from './model/Assets.model';
import { ClientUniverseView } from './views/ClientUniverse/ClientUniverse';

interface IAssetsState {
  formType: FormType;
  inspectorVisible: boolean;
  orderFormVisible: boolean;
  searchPanelVisibility: boolean;
  showLayoutManager: boolean;
  showCartInspector: boolean;
  showAssetInspector: boolean;
  rowData?: SelectedRowDataType;
}

const initialState: IAssetsState = {
  formType: FormType.order,
  inspectorVisible: false,
  orderFormVisible: false,
  searchPanelVisibility: false,
  showLayoutManager: false,
  showCartInspector: false,
  showAssetInspector: false,
  rowData: undefined,
};

enum ActionTypes {
  TOGGLE_CART,
  OPEN_LAYOUT_INSPECTOR,
  CLOSE_LAYOUT_INSPECTOR,
  CLICK_TAB,
  OPEN_INSPECTOR,
  CLOSE_INSPECTOR,
  CONTEXT_ITEM_CLICK,
  SHOW_NEW_ORDER_FORM,
  SHOW_ASSET_DETAILS,
}

const reducer = (state: IAssetsState, action: { type: ActionTypes; payload?: any }) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_CART:
      return {
        ...state,
        orderFormVisible: false,
        inspectorVisible: state.showCartInspector ? !state.inspectorVisible : true,
        searchPanelVisibility: false,
        showAssetInspector: false,
        showCartInspector: true,
        showLayoutManager: false,
      };
    case ActionTypes.OPEN_LAYOUT_INSPECTOR:
      return { ...state, showLayoutManager: true, inspectorVisible: true };
    case ActionTypes.CLOSE_LAYOUT_INSPECTOR:
      return { ...state, inspectorVisible: true, showLayoutManager: false };
    case ActionTypes.CLICK_TAB:
      return { ...state, inspectorVisible: false };
    case ActionTypes.OPEN_INSPECTOR:
      return { ...state, inspectorVisible: true };
    case ActionTypes.CLOSE_INSPECTOR:
      return { ...state, inspectorVisible: false, orderFormVisible: false, showAssetInspector: false };
    case ActionTypes.CONTEXT_ITEM_CLICK: {
      return {
        ...state,
        formType: action.payload.formType,
        orderFormVisible: true,
        inspectorVisible: true,
        showAssetInspector: true,
      };
    }
    case ActionTypes.SHOW_NEW_ORDER_FORM:
      return { ...state, orderFormVisible: true, inspectorVisible: true };
    case ActionTypes.SHOW_ASSET_DETAILS:
      return {
        ...state,
        inspectorVisible: true,
        orderFormVisible: false,
        searchPanelVisibility: false,
        showAssetInspector: true,
        showCartInspector: false,
        showLayoutManager: false,
        rowData: action.payload.rowData,
      };
    default:
      return state;
  }
};

const Assets: React.FunctionComponent<Props> = ({
  isLoadingClientUniverse = true,
  clientUniverse,
  getClientUniverse,
  actionArguments,
  setDefaultActionArgs,
  getActionArgs,
  path,
}) => {
  const routeProps = { path };
  const parameters = queryString.parse(location.search);
  const pageProps: Partial<PageProps> = { pageTitle: 'Assets', testid: 'page-assets' };
  const dataGridRef = useRef(null);
  const pageToolBarProps: Partial<ToolBarProps> = { active: routeProps.path };

  const { onDeleteAll, onDeleteAsset, assets, setAssets } = useCart({
    dataGridRef,
  });

  const [state, dispatch] = useReducer(reducer, initialState);

  const onShowAssetDetails = ({ rowData }: { rowData: SelectedRowDataType }) => {
    store.dispatch(updateEntities({ instrumentDisplayView: () => ({ displayName: rowData.Issuer }) }));
    dispatch({ type: ActionTypes.SHOW_ASSET_DETAILS, payload: { rowData } });
  };

  const onSelectionChanged = ({ selectedRowsData }: SelectionChangeData) => {
    const nextSelectedOrders = selectedRowsData.map(rowData => ({
      'Display Name': rowData.Issuer,
      _uri: rowData._uri,
      id: rowData.id,
    }));

    return setAssets(nextSelectedOrders);
  };

  const onRefreshTable = () => getClientUniverse();

  const onContextItemClick = (e: any) => {
    if (
      e.itemData.actionUri === 'instance/actions/create_new_order' ||
      e.itemData.actionUri === 'instance/actions/create_new_hypo'
    ) {
      dispatch({
        type: ActionTypes.CONTEXT_ITEM_CLICK,
        payload: {
          formType: e.itemData.actionUri === 'instance/actions/create_new_order' ? FormType.order : FormType.hypo,
        },
      });
      setDefaultActionArgs(e.itemData.actionUri);
    } else {
      dispatch({
        type: ActionTypes.SHOW_NEW_ORDER_FORM,
      });
      getActionArgs(e.itemData.actionUri);
    }
  };

  useEffect(() => {
    getClientUniverse();
  }, []);

  const closeInspector = () => {
    removeSelectedRowStyle();
    dispatch({ type: ActionTypes.CLOSE_INSPECTOR });
  };

  const onWatchListClick = () => console.log('On Watch List click');

  const onNewOrderClick = () => {
    getActionArgs('instance/actions/create_new_order');
    dispatch({ type: ActionTypes.SHOW_NEW_ORDER_FORM });
  };

  const onCloseLayoutManagerInspector = () => dispatch({ type: ActionTypes.CLOSE_LAYOUT_INSPECTOR });

  const onDropAssetInCart = (asset: SelectedRowDataType) => {
    if (dataGridRef) {
      const selectedRowKeys = (dataGridRef.current as any)?.instance?.state().selectedRowKeys || [];
      const nextSelectedRowKeys = selectedRowKeys.concat(asset._uri);
      (dataGridRef as any).current.instance.selectRows(nextSelectedRowKeys);
    }
  };

  const renderInspector = (actionAuth: ActionAuthParams) => {
    if (!state.inspectorVisible) return null;

    if (state.showLayoutManager) {
      return (
        <GlideLayoutManagerInspector
          onShare={(rowElement: ILayout) => console.log('On Share', rowElement)}
          closeInspector={onCloseLayoutManagerInspector}
        />
      );
    }

    if (state.showAssetInspector) {
      return (
        <InstrumentInspector
          formType={state.formType}
          rowData={state.rowData}
          onCloseInspector={closeInspector}
          onWatchListClick={onWatchListClick}
          onNewOrderClick={onNewOrderClick}
          showForm={state.orderFormVisible}
          onCancel={closeInspector}
          actionArguments={actionArguments}
          actionAuth={actionAuth}
        />
      );
    }

    if (state.showCartInspector) {
      return (
        <CartInspector
          actionArguments={actionArguments}
          assets={assets}
          onCloseInspector={closeInspector}
          rowDisplayKey="Display Name"
          showForm={state.orderFormVisible}
          onDeleteAsset={onDeleteAsset}
          onDeleteAll={onDeleteAll}
          actionAuth={actionAuth}
          onDropAssetInCart={onDropAssetInCart}
        />
      );
    }
    return null;
  };

  const dataSource = useMemo(
    () => ({
      data: clientUniverse.data.map((data: object, index: number) => ({ ...data, ...{ id: index } })),
      schema: clientUniverse.schema,
    }),
    [clientUniverse],
  );

  const { onClickTab, activeViewKey } = useViews({
    initialActiveViewKey: (parameters.activeView as string) || 'client-universe',
  });

  const handleOnClickTab = (tab: string) => {
    dispatch({
      type: ActionTypes.CLICK_TAB,
      payload: { selectionMode: tab === 'hypos' ? SelectionModeType.multiple : SelectionModeType.single },
    });
    onClickTab(tab);
  };

  return (
    <AuthContext.Consumer>
      {(actionAuth: any) => (
        <LayoutsProvider viewUri="client_universe" dataGridRef={dataGridRef}>
          <PageWrapper
            pageProps={pageProps}
            pageToolBarProps={pageToolBarProps}
            showInspector={state.inspectorVisible}
            closeInspector={closeInspector}
            activeViewKey={activeViewKey}
            inspector={state.inspectorVisible && renderInspector(actionAuth)}
            views={{ 'client-universe': 'Client Universe' }}
            onClickTab={handleOnClickTab}
            extraIconButtons={[
              {
                testId: 'cart-button',
                onClick: () => {
                  dispatch({ type: ActionTypes.TOGGLE_CART });
                },
                Icon: CartWithCounter,
                iconProps: { counter: assets.length },
              },
            ]}
            render={({ notification }) => {
              if (isLoadingClientUniverse) {
                return (
                  <Loading
                    type={LoadingIconType.Glide}
                    size={LoadingIconSizes.large}
                    show={true}
                    text="Loading Orders..."
                    full
                  />
                );
              }

              const ClientUniverseViews: Views = {
                'client-universe': () => (
                  <ClientUniverseView
                    assets={assets}
                    onRefresh={onRefreshTable}
                    dataSource={dataSource}
                    onRowClick={onShowAssetDetails}
                    onSettingsClick={() => dispatch({ type: ActionTypes.OPEN_LAYOUT_INSPECTOR })}
                    onSelectionChanged={onSelectionChanged}
                    onContextItemClick={onContextItemClick}
                    enableRowDragging
                    dropdownSelector={{
                      text: 'New Order',
                      onTextClick: () => onNewOrderClick(),
                    }}
                  />
                ),
              };

              return <ViewsWrapper notification={notification}>{ClientUniverseViews[activeViewKey]()}</ViewsWrapper>;
            }}
          />
        </LayoutsProvider>
      )}
    </AuthContext.Consumer>
  );
};

const mapStateToProps = (state: RootState): ReduxProps => {
  return {
    clientUniverse: ClientUniverse.selector(state) || { data: [], webLayouts: [] },
    actionArguments: ActionArguments.selector(state),
    isLoadingClientUniverse: ClientUniverse.pending(state),
    searchResults: SearchAssets.selector(state) || { data: [] },
    isLoadingSearchResults: SearchAssets.pending(state),
  };
};

const mapDispatchToProps = (dispatch: any): ReduxDispatch => ({
  getActionArgs: (uri: string) => dispatch(requestAsync(ActionArguments.get(uri))),
  getClientUniverse: () => dispatch(requestAsync(ClientUniverse.get())),
  setDefaultActionArgs: (action_uri: string) => {
    store.dispatch(updateEntities({ actionArguments: () => ({ action_uri }) }));
  },
  searchAssets: (assetName: string, assetType: string) =>
    dispatch(requestAsync(SearchAssets.get(assetName, assetType))),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(Assets);
