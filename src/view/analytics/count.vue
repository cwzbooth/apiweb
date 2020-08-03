<style scoped>
  @import './count.less';
</style>
<template>
  <div>
    <Row>
      <Col span="24">
        <Card class="margin-bottom-10">
          <Form inline>
            <FormItem class="margin-bottom-0">
              <Select v-model="searchConf.type" clearable placeholder="请选择类别" style="width:120px">
                <Option :value="1">用户昵称</Option>
                <Option :value="2">用户openid</Option>
                <Option :value="3">接口映射</Option>
                <Option :value="4">接口组标识</Option>
                <Option :value="5">应用AppId</Option>
                <Option :value="6">应用组标识</Option>
              </Select>
            </FormItem>
            <FormItem class="margin-bottom-0">
              <Input v-model="searchConf.keywords" placeholder=""></Input>
            </FormItem>
            <FormItem class="margin-bottom-0">
              <Button type="primary" @click="search">{{ $t('find_button') }}/{{ $t('refresh_button') }}</Button>
            </FormItem>
          </Form>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col span="24">
        <Card>
          <div>
            <Table :loading="listLoading" :columns="columnsList" :data="tableData" border disabled-hover></Table>
          </div>
          <div class="margin-top-15" style="text-align: center">
            <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                  :page-size="tableShow.pageSize" @on-change="changePage"
                  @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
import { getList } from '@/api/count'
import expandRow from './table_expandCount.vue'
import { getDate } from '@/libs/tools'

export default {
  name: 'system_user',
  components: { expandRow },
  data () {
    return {
      columnsList: [
        {
          title: 'D',
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: '用户名',
          align: 'center',
          key: 'username',
          width: 85
        },
        {
          title: '头像',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('img', {
              attrs: {
                class: 'avatar',
                src: params.row.avatar
              }
            })
          }
        },
        {
          title: 'Openid',
          align: 'center',
          key: 'openid',
          minWidth: 50
        },
        {
          title: 'UUID',
          align: 'center',
          key: 'uuid',
          minWidth: 130
        },
        {
          title: '应用名称',
          align: 'center',
          key: 'app_name',
          minWidth: 130,
          render: (h, params) => {
            return h('span', params.row.app_name + '  (接口：' + params.row.api_class + ')')
          }
        },
        {
          title: '来源',
          align: 'center',
          key: 'from_url',
          minWidth: 50
        },
        {
          title: 'platform',
          align: 'center',
          key: 'platform',
          minWidth: 50
        },
        {
          title: 'model',
          align: 'center',
          key: 'model',
          minWidth: 50
        },
        {
          title: '发送时间',
          align: 'center',
          width: 170,
          render: (h, params) => {
            return h('span', getDate(params.row.create_time, 'year'))
          }
        },
        {
          title: 'ip',
          align: 'center',
          key: 'create_ip',
          minWidth: 100
        }
      ],
      tableData: [],
      tableShow: {
        currentPage: 1,
        pageSize: 20,
        listCount: 0
      },
      searchConf: {
        type: '',
        keywords: '',
        status: ''
      },
      modalSetting: {
        show: false,
        loading: false,
        index: 0
      },
      buttonShow: {
        del: true
      },
      listLoading: false
    }
  },
  created () {
    let vm = this
    vm.getList()
    vm.hasRule('Count/del').then(res => {
      vm.buttonShow.del = res
    })
  },
  methods: {
    changePage (page) {
      this.tableShow.currentPage = page
      this.getList()
    },
    changeSize (size) {
      this.tableShow.pageSize = size
      this.getList()
    },
    search () {
      this.tableShow.currentPage = 1
      this.getList()
    },
    getList () {
      let vm = this
      let params = {
        page: vm.tableShow.currentPage,
        size: vm.tableShow.pageSize,
        type: vm.searchConf.type,
        keywords: vm.searchConf.keywords
      }
      vm.listLoading = true
      getList(params).then(response => {
        vm.tableData = response.data.data.list
        vm.tableShow.listCount = response.data.data.count
        vm.listLoading = false
      })
    }
  }
}
</script>
