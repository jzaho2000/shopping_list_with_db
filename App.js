import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';



export default function App() {

  const[product, setProduct] = React.useState('');
  const[amount, setAmount] = React.useState('');
  const[shoppinglist, setShoppinglist] = React.useState([]);
  const db = SQLite.openDatabase('shoppinglist.db');


  // db.  transaction(callback, error, success)
  useEffect( () => {
    db.transaction(
      tx => {
        // Jos taulukko ei ole olemassa, niin luo uusi taulukko missä
        //    * id on lukuarvoinen pääavain, joka ei voi olla null
        //    * product = tuote, joka on tekstiarvoinen joka ei voi olla null, 
        //      koska kyseessä on kuitenkin ostoslista
        //    * amount = määrä, joka on tekstiarvoinen. Tämä voi saada null arvoja,
        //      jos vaikka kyseessä iso tuote tai jos halutaan ostaa yksittäinen tuote.
        tx.executeSql('create table if not exists shoppinglist(id  integer primary key not null, product text not null, amount text);');
      }, 
      showError, 
      updateList
    );
    
  }, []);


  // Kehitysvaiheen funktio, joka kertoo tietokantakyselyissä tapahtuneet virheet
  const showError = (error) => {
    //console.log(error.message);
  }

  const updateList = () =>  {
    db.transaction( 
      tx => {
          tx.executeSql('select id, product, amount from shoppinglist;', [], (_, {rows})  =>setShoppinglist(rows._array) );
      }, 
      showError, 
      null
    );
  }


  const saveProduct = () => {

    if (product == null || product.trim() == '' )
      return;

    if (amount != null && amount.trim() == '')
      setAmount(null);

    db.transaction(
      tx => {
          tx.executeSql('insert into shoppinglist (product, amount) values (?, ?);',
                        [product, amount]);
          setProduct('');
          setAmount('');
      },
      showError,
      updateList
    );

  }

  const deleteProduct = (id) => {
    //console.log("Delete product " + id);

    db.transaction(
      tx => {
          tx.executeSql('delete from shoppinglist where id = ?', [id]);
      },
      showError,
      updateList
    );

  }

  const listSeparator = () => {
    return (
      <View
        style={{
          height: 5,
          width: "80%",
          backgroundColor: "#fff",
          marginLeft: "10%"
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      
      <TextInput style={styles.nfield} placeholder="Product" onChangeText={product => setProduct(product)} value={product} />
      <TextInput style={styles.nfield} placeholder="Amount" onChangeText={amount => setAmount(amount)} value={amount} />

      <View style={styles.container2}>
        <Button title="SAVE" onPress={() => saveProduct()} />
      </View>

      <View style={styles.container3} >
        <Text style={styles.header} >Shopping List</Text>
      </View>

      
      <FlatList nativeID="plist" 
               numColumns={1}
               style={styles.listStyle} 
               data={shoppinglist} 
               keyExtractor ={item => item.id.toString()}
               renderItem={({item}) => (
                  <View style={styles.litem}>
                      <Text style={styles.productText}>{item.product}, {item.amount}</Text>
                      <Text style={styles.deleteText} onPress={() => deleteProduct(item.id) }>bought</Text>
                  </View>
               )}
               ItemSeparatorComponent={listSeparator} 
      />
     

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container2: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  container3 : {
    marginTop: 20,
    marginBottom: 0,
    width: '80%',
    alignItems: 'center'
    
  },
  header: {
    fontWeight: 'bold',
    //color: 'blue',
    fontSize: 17
  }, 

  nfield: {
    width: 200, 
    borderColor: 'gray', 
    borderWidth: 1,
    marginTop: 0,
    marginBottom: 10
  },

  listStyle: {
    flex: 1,
    width: '80%',
    paddingLeft: 5,
    paddingRight: 5
  }, 

  litem : {
    flexDirection: 'row',
    alignSelf: 'center'
  },
  productText : {
    fontSize: 15
  },
  deleteText : {
    color: 'blue',
    fontSize: 12
  }
});
