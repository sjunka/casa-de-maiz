import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useMenu } from '../api/useMenu';
import { BlockList } from '../blocks/BlockList';
import { ContentStatus, SavedContentBanner } from '../ui/ContentStatus';

export const MenuScreen = () => {
  const { data, error, isLoading, isFetching, refetch } = useMenu();
  const isEmpty = !!data && data.data.layout.length === 0;

  if (isLoading || error || isEmpty) {
    return (
      <ContentStatus
        title="Menu"
        loadingLabel="Loading menu…"
        emptyLabel="There's nothing on the menu yet."
        isLoading={isLoading}
        error={error}
        isEmpty={isEmpty}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollView
      style={styles.fill}
      testID="menu-success"
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />}
    >
      {data.isSaved && <SavedContentBanner />}
      <BlockList layout={data.data.layout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
