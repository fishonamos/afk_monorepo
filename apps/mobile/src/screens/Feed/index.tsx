import { NDKKind } from '@nostr-dev-kit/ndk';
import { useAllProfiles, useContacts, useSearch, useSearchNotes } from 'afk_nostr_sdk';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, View } from 'react-native';

import { AddPostIcon } from '../../assets/icons';
import { BubbleUser } from '../../components/BubbleUser';
import SearchComponent from '../../components/search';
import { useStyles, useTheme } from '../../hooks';
import { ChannelComponent } from '../../modules/ChannelCard';
import { PostCard } from '../../modules/PostCard';
import { FeedScreenProps } from '../../types';
import stylesheet from './styles';

export const Feed: React.FC<FeedScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useStyles(stylesheet);
  const profiles = useAllProfiles();
  const [activeSortBy, setSortBy] = useState<string | undefined>()
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [kinds, setKinds] = useState<NDKKind[]>([
    NDKKind.Text,
    NDKKind.ChannelCreation,
    NDKKind.GroupChat,
    NDKKind.ChannelMessage,
    NDKKind.Metadata,
  ]);

  const contacts = useContacts()
  console.log("contacts", contacts)
  const notes = useSearch({
    // search: search,
    kinds,
    // authors: activeSortBy && contacts?.data?.?? [],
    // sortBy: activeSortBy,
  });


  // Filter profiles based on the search query
  const profilesSearch =
    profiles?.data?.pages
      ?.flat()
    //   .filter((item) => (search && search?.length > 0 ? item?.content?.includes(search) : true)) ??
    ?? [];

  // Filter notes based on the search query
  const filteredNotes = notes.data?.pages
    .flat()
    .filter((item) => (search && search?.length > 0 ? item?.content?.includes(search) : true)) ?? [];

  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImage}
        source={require('../../assets/feed-background-afk.png')}
        resizeMode="cover"
      />

      <SearchComponent
        setSearchQuery={setSearch}
        searchQuery={search ?? ''}
        kinds={kinds}
        setKinds={setKinds}
        setSortBy={setSortBy}
        sortBy={activeSortBy}
        contactList={contacts?.data?.map((item) => item)}
      />

      {notes?.isLoading && <ActivityIndicator></ActivityIndicator>}

      <FlatList
        ListHeaderComponent={<>
          <FlatList
            contentContainerStyle={styles.stories}
            horizontal
            data={profilesSearch}
            showsHorizontalScrollIndicator={false}
            onEndReached={() => profiles.fetchNextPage()}
            refreshControl={
              <RefreshControl refreshing={profiles.isFetching} onRefresh={() => profiles.refetch()} />
            }
            ItemSeparatorComponent={() => <View style={styles.storySeparator} />}
            renderItem={({ item }) => <BubbleUser event={item} />}
          /></>}
        contentContainerStyle={styles.flatListContent}
        data={filteredNotes}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => {
          if (item.kind === NDKKind.ChannelCreation || item.kind === NDKKind.ChannelMetadata) {
            return <ChannelComponent event={item} />;
          } 
          else if (item.kind === NDKKind.ChannelMessage) {
            return <PostCard event={item} />;
          } 
          else if (item.kind === NDKKind.Text) {
            return <PostCard event={item} />;
          }
          return <></>;
        }}
        refreshControl={
          <RefreshControl refreshing={notes.isFetching} onRefresh={() => notes.refetch()} />
        }
        onEndReached={() => notes.fetchNextPage()}
      />

      <Pressable
        style={styles.createPostButton}
        onPress={() => navigation.navigate('MainStack', { screen: 'CreateForm' })}
      >
        <AddPostIcon width={72} height={72} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
};
