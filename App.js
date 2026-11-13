import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, Image, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, Share, StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PINS = [
  ["1","Minimal living room","Home","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800"],
  ["2","Mountain getaway","Travel","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"],
  ["3","Everyday fashion","Fashion","https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"],
  ["4","Blue ocean","Nature","https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800"],
  ["5","Colourful artwork","Art","https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"],
  ["6","Modern architecture","Architecture","https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800"],
  ["7","Lifestyle inspiration","Lifestyle","https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"],
  ["8","Forest views","Nature","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"],
  ["9","City travel","Travel","https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800"],
  ["10","Warm home decor","Home","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800"],
  ["11","Fashion ideas","Fashion","https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"],
  ["12","Building inspiration","Architecture","https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800"]
].map(([id,title,category,image]) => ({id,title,category,image}));

const CATEGORIES = ["All","Fashion","Nature","Art","Travel","Lifestyle","Home","Architecture"];

export default function App() {
  const [page, setPage] = useState("Explore");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [savedIds, setSavedIds] = useState([]);
  const [displayName, setDisplayName] = useState("Pinly User");

  useEffect(() => {
    AsyncStorage.getItem("pinly_saved_ids")
      .then(value => { if (value) setSavedIds(JSON.parse(value)); })
      .catch(() => {});
  }, []);

  async function toggleSaved(id) {
    const updated = savedIds.includes(id)
      ? savedIds.filter(savedId => savedId !== id)
      : [...savedIds, id];
    setSavedIds(updated);
    try {
      await AsyncStorage.setItem("pinly_saved_ids", JSON.stringify(updated));
    } catch (_) {}
  }

  const visiblePins = useMemo(() => {
    let list = page === "Saved" ? PINS.filter(pin => savedIds.includes(pin.id)) : PINS;
    if (page === "Explore" && category !== "All") {
      list = list.filter(pin => pin.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(pin => `${pin.title} ${pin.category}`.toLowerCase().includes(q));
    }
    return list;
  }, [page, category, query, savedIds]);

  function PinCard({item}) {
    return (
      <View style={styles.card}>
        <Image source={{uri:item.image}} style={styles.pinImage} resizeMode="cover" />
        <View style={styles.cardInfo}>
          <View style={{flex:1}}>
            <Text style={styles.pinTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.pinCategory}>{item.category}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleSaved(item.id)} style={styles.iconButton}>
            <Text style={styles.iconText}>{savedIds.includes(item.id) ? "♥" : "♡"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Share.share({message: `${item.title}\n${item.image}`})}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8fb" />
      <View style={styles.header}>
        <Text style={styles.logo}>pinly</Text>
        <Text style={styles.tagline}>Find ideas. Save what you love.</Text>
      </View>

      {page === "Profile" ? (
        <View style={styles.centerPage}>
          <View style={styles.avatar}><Text style={styles.avatarText}>P</Text></View>
          <Text style={styles.pageTitle}>Your profile</Text>
          <TextInput value={displayName} onChangeText={setDisplayName}
            placeholder="Enter your name" style={styles.nameInput} />
          <Text style={styles.helper}>Saved ideas: {savedIds.length}</Text>
        </View>
      ) : page === "Create" ? (
        <View style={styles.centerPage}>
          <Text style={styles.pageTitle}>Create a Pin</Text>
          <Text style={styles.helper}>Photo upload will be added in a future version.</Text>
          <Text style={styles.helper}>For now, explore and save your favourite ideas.</Text>
        </View>
      ) : (
        <>
          <TextInput value={query} onChangeText={setQuery}
            placeholder="Search ideas..." placeholderTextColor="#888"
            style={styles.search} />
          {page === "Explore" && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
              {CATEGORIES.map(item => (
                <TouchableOpacity key={item} onPress={() => setCategory(item)}
                  style={[styles.chip, category === item && styles.activeChip]}>
                  <Text style={[styles.chipText, category === item && styles.activeChipText]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <FlatList
            key={page}
            data={visiblePins}
            renderItem={PinCard}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={<Text style={styles.empty}>No ideas found.</Text>}
          />
        </>
      )}

      <View style={styles.bottomNav}>
        {["Explore","Saved","Create","Profile"].map(item => (
          <TouchableOpacity key={item} onPress={() => {setPage(item);setQuery("");}}
            style={styles.navItem}>
            <Text style={[styles.navSymbol, page === item && styles.selected]}>{{
              Explore:"⌕", Saved:"♥", Create:"+", Profile:"●"
            }[item]}</Text>
            <Text style={[styles.navText, page === item && styles.selected]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#fff8fb"},
  header:{paddingHorizontal:18,paddingTop:10,paddingBottom:8},
  logo:{fontSize:34,fontWeight:"900",color:"#d63384",letterSpacing:-1},
  tagline:{fontSize:12,color:"#777"},
  search:{marginHorizontal:16,marginTop:10,marginBottom:8,backgroundColor:"#f1edf1",borderRadius:14,paddingHorizontal:16,paddingVertical:12,fontSize:15,color:"#222"},
  categories:{maxHeight:48,marginBottom:8,paddingLeft:12},
  chip:{paddingHorizontal:15,paddingVertical:9,borderRadius:20,backgroundColor:"#f1edf1",marginHorizontal:4},
  activeChip:{backgroundColor:"#d63384"},
  chipText:{color:"#555",fontWeight:"600"},
  activeChipText:{color:"#fff"},
  grid:{paddingHorizontal:10,paddingBottom:90},
  row:{justifyContent:"space-between"},
  card:{width:"48.5%",backgroundColor:"#fff",borderRadius:15,overflow:"hidden",marginBottom:12,elevation:2},
  pinImage:{width:"100%",height:175,backgroundColor:"#eee"},
  cardInfo:{padding:8,flexDirection:"row",alignItems:"center"},
  pinTitle:{fontSize:12,fontWeight:"700",color:"#29232a"},
  pinCategory:{fontSize:10,color:"#888",marginTop:3},
  iconButton:{paddingHorizontal:5,paddingVertical:5},
  iconText:{fontSize:19,color:"#d63384"},
  empty:{textAlign:"center",color:"#777",marginTop:40},
  bottomNav:{position:"absolute",bottom:0,left:0,right:0,height:65,backgroundColor:"#fff",borderTopWidth:1,borderTopColor:"#eee",flexDirection:"row",justifyContent:"space-around",alignItems:"center"},
  navItem:{alignItems:"center",minWidth:65},
  navSymbol:{fontSize:20,color:"#777"},
  navText:{fontSize:10,color:"#777",marginTop:2},
  selected:{color:"#d63384",fontWeight:"800"},
  centerPage:{flex:1,alignItems:"center",justifyContent:"center",padding:24},
  avatar:{width:76,height:76,borderRadius:38,backgroundColor:"#f8d7e8",alignItems:"center",justifyContent:"center",marginBottom:14},
  avatarText:{fontSize:32,fontWeight:"800",color:"#d63384"},
  pageTitle:{fontSize:23,fontWeight:"800",color:"#29232a",marginBottom:16},
  nameInput:{width:"100%",backgroundColor:"#f1edf1",padding:14,borderRadius:12,textAlign:"center",marginBottom:12,color:"#222"},
  helper:{color:"#777",fontSize:14,textAlign:"center",marginTop:8}
});
