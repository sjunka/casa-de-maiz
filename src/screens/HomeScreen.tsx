import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useHome } from '../api/useHome';
import { BlockList } from '../blocks/BlockList';
import { ContentStatus, SavedContentBanner } from '../ui/ContentStatus';

export const HomeScreen = () => {
  const { data, error, isLoading, isFetching, refetch } = useHome();
  const isEmpty = !!data && data.data.layout.length === 0;

  if (isLoading || error || isEmpty) {
    return (
      <ContentStatus
        title="Casa Maiz"
        loadingLabel="Loading Casa Maiz…"
        emptyLabel="There's nothing here yet."
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
      testID="home-success"
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
